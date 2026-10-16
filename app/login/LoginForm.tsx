"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, post } from "@/lib/client/api";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowRightIcon } from "../components/portal/icons";
import { Panel } from "../components/portal/Panel";

interface Persona {
  email: string;
  name: string;
  label: string;
  hint: string;
}

export function LoginForm({
  personas,
  passwordRequired,
}: {
  personas: Persona[];
  passwordRequired: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(address: string, pwd?: string) {
    setBusy(address);
    setError(null);
    try {
      await post("/api/auth/login", { email: address, password: pwd });
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not sign in.");
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-[18px] font-semibold shadow-md">
            J
          </span>
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] leading-tight">Digital HR</h1>
            <p className="text-[14px] text-neutral-500 mt-1 leading-relaxed">
              Requests, training and answers.
              <br />
              One portal instead of five systems.
            </p>
          </div>
        </div>

        <Panel padding="p-5">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void signIn(email, passwordRequired ? password : undefined);
            }}
          >
            <Input
              label="Work e-mail"
              type="email"
              autoComplete="username"
              placeholder="name@jana.example"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
            {passwordRequired && (
              <Input
                label="Demo password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />
            )}
            {error && (
              <p role="alert" className="text-[12.5px] text-red-600 font-medium">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={busy !== null || !email}>
              {busy === email ? "Signing in…" : "Sign in"}
              <ArrowRightIcon size={13} />
            </Button>
            <p className="text-[11.5px] text-neutral-400 leading-relaxed text-center">
              {passwordRequired
                ? "Mock SSO with a shared demo password."
                : "Mock SSO: no passwords are stored or needed in this prototype. A corporate identity provider replaces this screen in production."}
            </p>
          </form>
        </Panel>

        <section aria-labelledby="demo-accounts" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 id="demo-accounts" className="text-[12px] font-semibold uppercase tracking-widest text-neutral-400">
              Demo accounts
            </h2>
            <span className="text-[11.5px] text-neutral-400">fictional people</span>
          </div>
          <ul className="flex flex-col gap-2">
            {personas.map((p) => (
              <li key={p.email}>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void signIn(p.email, passwordRequired ? password : undefined)}
                  className="group/p w-full flex items-center gap-3 text-left bg-white rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] disabled:opacity-50"
                  style={{
                    boxShadow:
                      "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <Avatar name={p.name} size="md" />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-neutral-900 truncate">{p.name}</span>
                      <Badge variant={p.label.startsWith("Employee") ? "muted" : p.label.startsWith("Manager") ? "accent" : "default"}>
                        {p.label}
                      </Badge>
                    </span>
                    <span className="block text-[12px] text-neutral-400 truncate mt-0.5">{p.hint}</span>
                  </span>
                  <ArrowRightIcon
                    size={14}
                    className="text-neutral-300 transition-all duration-200 group-hover/p:text-neutral-700 group-hover/p:translate-x-0.5"
                  />
                </button>
              </li>
            ))}
          </ul>
          {passwordRequired && (
            <p className="text-[11.5px] text-neutral-400 px-1">Enter the demo password above first, then pick an account.</p>
          )}
        </section>
      </div>
    </div>
  );
}
