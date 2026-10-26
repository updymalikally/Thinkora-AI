"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { SocialAuthButtons } from "@/components/social-auth-buttons";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.email({ email, password, callbackURL: "/chat" });
      if (result.error) setError(result.error.message ?? "Sign-in failed.");
      else router.push("/chat");
    } catch {
      setError("Sign-in failed. Please try again.");
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
        <h1>Welcome back</h1>
        <p>Sign in to continue your conversations.</p>
        <form onSubmit={submit}>
          <label className="field">Email<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="field">Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
          {error && <p role="alert" style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
          <div className="auth-actions">
            <button className="button primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
            <SocialAuthButtons disabled={busy} onSignIn={provider => void social(provider)} />
          </div>
        </form>
        <div className="auth-foot">New to Thinkora? <Link href="/sign-up" style={{ color: "var(--accent)" }}>Create an account</Link></div>
      </section>
    </main>
  );
}
