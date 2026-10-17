"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, post } from "@/lib/client/api";
import { clearApiCache } from "@/lib/client/hooks";
import { LocaleSwitch, useI18n } from "@/lib/i18n/I18nProvider";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowRightIcon, LogoMark } from "../components/portal/icons";

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
      clearApiCache();
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : m.login.fail);
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="app-container h-14 flex items-center justify-end">
        <LocaleSwitch />
      </header>

      <main className="flex-1 flex justify-center px-4 pt-6 pb-16 sm:pt-[8vh]">
        <div className="w-full max-w-[380px]">
          <LogoMark size={28} className="text-logo" />
          <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.035em] leading-tight text-hero-foreground">{m.login.title}</h1>
          <p className="mt-2 text-[14px] text-hero-muted leading-relaxed whitespace-pre-line">{m.login.lead}</p>

          <form
            className="mt-8 flex flex-col gap-3"
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
            </Button>
          </form>
          <p className="mt-3 text-[11.5px] text-tertiary leading-relaxed">{passwordRequired ? m.login.ssoPassword : m.login.sso}</p>

          <section aria-labelledby="demo-accounts" className="mt-10">
            <div className="flex items-center gap-3">
              <span aria-hidden className="flex-1 h-px bg-hero-border" />
              <h2 id="demo-accounts" className="text-[10px] font-semibold uppercase tracking-widest text-tertiary">
                {m.login.demos}
              </h2>
              <span aria-hidden className="flex-1 h-px bg-hero-border" />
            </div>
            <ul className="mt-4 rounded-xl border border-hero-border bg-hero-elevated divide-y divide-hero-border overflow-hidden">
              {personas.map((p) => (
                <li key={p.email}>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void signIn(p.email, passwordRequired ? password : undefined)}
                    className="group/p w-full flex items-center gap-3 text-left px-3.5 py-3 cursor-pointer transition-colors hover:bg-hero-cell-bg/70 disabled:opacity-50 disabled:cursor-default"
                  >
                    <Avatar name={p.name} size="sm" />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[13px] font-medium text-hero-foreground truncate">{p.name}</span>
                        <span className="shrink-0 text-[11px] text-tertiary">{PERSONA_LABELS[p.label] ?? p.label}</span>
                      </span>
                      <span className="block text-[11.5px] text-tertiary truncate mt-0.5">
                        {busy === p.email ? m.login.entering : (PERSONA_HINTS[p.email] ?? p.hint)}
                      </span>
                    </span>
                    <ArrowRightIcon
                      size={12}
                      className="shrink-0 text-tertiary opacity-0 -translate-x-1 transition-all duration-200 group-hover/p:opacity-100 group-hover/p:translate-x-0"
                    />
                  </button>
                </li>
              ))}
            </ul>
            {passwordRequired && <p className="mt-2.5 text-[11.5px] text-tertiary">{m.login.passwordFirst}</p>}
          </section>
        </div>
      </main>
    </div>
  );
}
