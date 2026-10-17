"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, post } from "@/lib/client/api";
import { LocaleSwitch, useI18n } from "@/lib/i18n/I18nProvider";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowRightIcon, LogoMark } from "../components/portal/icons";
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
  const { m } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const PERSONA_LABELS = m.login.roles;
  const PERSONA_HINTS = m.login.hints;

  async function signIn(address: string, pwd?: string) {
    setBusy(address);
    setError(null);
    try {
      await post("/api/auth/login", { email: address, password: pwd });
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : m.login.fail);
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="self-end">
            <LocaleSwitch />
          </div>
          <span className="w-11 h-11 rounded-xl bg-logo text-hero-on-foreground flex items-center justify-center shadow-md">
            <LogoMark size={22} />
          </span>
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] leading-tight">{m.login.title}</h1>
            <p className="text-[14px] text-hero-muted mt-1 leading-relaxed whitespace-pre-line">{m.login.lead}</p>
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
              label={m.login.email}
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
                label={m.login.password}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
              />
            )}
            {error && (
              <p role="alert" className="text-[12.5px] text-error font-medium">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={busy !== null || !email}>
              {busy === email ? m.login.entering : m.login.enter}
              <ArrowRightIcon size={13} />
            </Button>
            <p className="text-[11.5px] text-tertiary leading-relaxed text-center">
              {passwordRequired ? m.login.ssoPassword : m.login.sso}
            </p>
          </form>
        </Panel>

        <section aria-labelledby="demo-accounts" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 id="demo-accounts" className="text-[12px] font-semibold uppercase tracking-widest text-tertiary">
              {m.login.demos}
            </h2>
            <span className="text-[11.5px] text-tertiary">{m.login.demoHint}</span>
          </div>
          <ul className="flex flex-col gap-2">
            {personas.map((p) => (
              <li key={p.email}>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void signIn(p.email, passwordRequired ? password : undefined)}
                  className="group/p w-full flex items-center gap-3 text-left bg-hero-elevated rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] disabled:opacity-50"
                  style={{
                    boxShadow:
                      "0 1px 2px rgba(17,17,17,0.04), 0 2px 8px -2px rgba(17,17,17,0.04), 0 0 0 1px rgba(17,17,17,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <Avatar name={p.name} size="md" />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-hero-foreground truncate">{p.name}</span>
                      <Badge variant={p.label.startsWith("Employee") ? "muted" : p.label.startsWith("Manager") ? "accent" : "default"}>
                        {PERSONA_LABELS[p.label] ?? p.label}
                      </Badge>
                    </span>
                    <span className="block text-[12px] text-tertiary truncate mt-0.5">{PERSONA_HINTS[p.email] ?? p.hint}</span>
                  </span>
                  <ArrowRightIcon
                    size={14}
                    className="text-tertiary transition-all duration-200 group-hover/p:text-hero-foreground group-hover/p:translate-x-0.5"
                  />
                </button>
              </li>
            ))}
          </ul>
          {passwordRequired && (
            <p className="text-[11.5px] text-tertiary px-1">{m.login.passwordFirst}</p>
          )}
        </section>
      </div>
    </div>
  );
}
