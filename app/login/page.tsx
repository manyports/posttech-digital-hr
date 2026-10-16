import { redirect } from "next/navigation";
import { getActor, passwordRequired } from "@/lib/server/auth/session";
import { DEMO_PERSONAS } from "@/lib/seed/seed";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in · Digital HR" };

export default async function LoginPage() {
  if (await getActor()) redirect("/dashboard");
  return (
    <LoginForm
      personas={DEMO_PERSONAS.map((p) => ({ ...p }))}
      passwordRequired={passwordRequired()}
    />
  );
}
