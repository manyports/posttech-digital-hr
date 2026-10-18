import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionDoc } from "../../domain/types";
import { getDb } from "../db";
import { forbidden, unauthorized } from "../errors";
import type { Actor } from "../policy";
import type { Role } from "../../domain/types";

/**
 * Sessions are opaque random tokens stored in the database (collection
 * `sessions`) and sent in an httpOnly cookie. There is no signing secret and
 * no password in the repository: tokens are generated at runtime.
 *
 * Login is a mock SSO: employees sign in by e-mail. If the DEMO_PASSWORD
 * environment variable is set, that shared password is also required.
 * In production this module is replaced by the corporate IdP (OIDC/SAML).
 */

export const SESSION_COOKIE = "hr_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/**
 * Cookie value is "<userId>.<token>". Carrying the user id lets getActor load
 * the session and the employee in parallel (one DB round-trip instead of two);
 * the session is still the authority, and must belong to that same user.
 * Tokens are base64url, so they never contain ".".
 */
function readCookie(value: string | undefined): { userId: string | null; token: string } | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  return dot === -1 ? { userId: null, token: value } : { userId: value.slice(0, dot), token: value.slice(dot + 1) };
}

export type { Actor };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function passwordRequired(): boolean {
  return Boolean(process.env.DEMO_PASSWORD);
}

/** Fails closed: with no DEMO_PASSWORD configured, nothing matches. */
export function checkDemoPassword(password: unknown): boolean {
  const expected = process.env.DEMO_PASSWORD;
  return Boolean(expected) && typeof password === "string" && safeEqual(password, expected!);
}

export async function login(email: string, password?: string) {
  const db = await getDb();
  const user = await db.employees.findOne({ email: email.trim().toLowerCase() });
  const expected = process.env.DEMO_PASSWORD;
  const passwordOk = !expected || (password !== undefined && safeEqual(password, expected));
  // Same message for unknown e-mail and wrong password (no account probing).
  if (!user || !user.active || !passwordOk) {
    throw unauthorized("Invalid e-mail or password.");
  }

  const now = Date.now();
  const session: SessionDoc = {
    _id: randomBytes(32).toString("base64url"),
    userId: user._id,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
  await Promise.all([
    db.sessions.insertOne(session),
    // Housekeeping: drop sessions that have already expired (ISO strings sort by time).
    db.sessions.deleteMany({ expiresAt: { $lt: new Date(now).toISOString() } }),
  ]);

  const store = await cookies();
  store.set(SESSION_COOKIE, `${user._id}.${session._id}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return toActor(user);
}

export async function logout() {
  const store = await cookies();
  const parsed = readCookie(store.get(SESSION_COOKIE)?.value);
  if (parsed) {
    const db = await getDb();
    await db.sessions.deleteMany({ _id: parsed.token });
  }
  store.delete(SESSION_COOKIE);
}

function toActor(u: {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  position: string;
  department: string;
}): Actor {
  return {
    id: u._id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    position: u.position,
    department: u.department,
  };
}

/**
 * Resolve the signed-in user. Role is ALWAYS re-read from the employee record
 * (never from the cookie), so permission changes apply immediately.
 */
export async function getActor(): Promise<Actor | null> {
  const store = await cookies();
  const parsed = readCookie(store.get(SESSION_COOKIE)?.value);
  if (!parsed) return null;
  const db = await getDb();
  const [session, prefetched] = await Promise.all([
    db.sessions.findOne({ _id: parsed.token }),
    parsed.userId ? db.employees.findOne({ _id: parsed.userId }) : null,
  ]);
  if (!session) return null;
  if (session.expiresAt < new Date().toISOString()) {
    await db.sessions.deleteMany({ _id: parsed.token });
    return null;
  }
  // Old cookies (token only) fall back to a second lookup.
  const user = parsed.userId === session.userId ? prefetched : await db.employees.findOne({ _id: session.userId });
  return user && user.active ? toActor(user) : null;
}

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw unauthorized();
  return actor;
}

export async function requireRole(...roles: Role[]): Promise<Actor> {
  const actor = await requireActor();
  if (!roles.includes(actor.role)) throw forbidden("Your role can't perform this action.");
  return actor;
}
