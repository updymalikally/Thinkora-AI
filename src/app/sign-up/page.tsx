"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import { authClient } from "@/lib/auth/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signUp.email({ name, email, password, callbackURL: "/chat" });
      if (result.error) setError(result.error.message ?? "Account creation failed.");
      else router.push("/chat");
    } catch {
      setError("Account creation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "github") {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.social({ provider, callbackURL: "/chat" });
      if (result.error) setError(result.error.message ?? `${provider === "google" ? "Google" : "GitHub"} sign-in failed.`);
    } catch {
      setError(`${provider === "google" ? "Google" : "GitHub"} sign-in could not start. Check the OAuth configuration and try again.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">Thinkora<span> AI</span></div>
        <h1>Create your account</h1>
        <p>Your conversations stay private to your account.</p>
        <form onSubmit={submit}>
          <label className="field">Name<input autoComplete="name" required value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="field">Email<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="field">Password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>
          {error && <p role="alert" style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
          <div className="auth-actions">
            <button className="button primary" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
            <SocialAuthButtons disabled={busy} onSignIn={provider => void social(provider)} />
          </div>
        </form>
        <div className="auth-foot">Already registered? <Link href="/sign-in" style={{ color: "var(--accent)" }}>Sign in</Link></div>
      </section>
    </main>
  );
}
