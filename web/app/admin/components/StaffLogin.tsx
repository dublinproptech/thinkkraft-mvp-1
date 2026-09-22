"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Spinner } from "./ui";

// The sign-in form behind both /admin/login and /teacher/login.
//
// Staff sign in on their own page rather than the children's one, which asks
// for a username and a PIN. The credentials provider is the same either way;
// role is decided by the account, never by which page was used, so signing in
// here as the wrong role fails the check below rather than granting anything.

type Props = {
  role: "ADMIN" | "TEACHER";
  title: string;
  description: string;
  /** Where to land when the role is right and no callbackUrl was given. */
  home: string;
};

export default function StaffLogin({ role, title, description, home }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        usernameOrEmail: email.trim(),
        password,
        redirect: false,
      });

      if (!res?.ok) {
        setError("That email and password do not match an account.");
        setBusy(false);
        return;
      }

      // The sign-in worked, but as whom? A parent's password is still a valid
      // password; it just is not one that belongs on this page.
      const session = await fetch("/api/auth/session").then((r) => r.json());
      if (session?.user?.role !== role) {
        setError(`That account is not ${role === "ADMIN" ? "an admin" : "a teacher"}.`);
        setBusy(false);
        return;
      }

      toast.success(`Signed in as ${session.user.name ?? session.user.email}`);
      // callbackUrl is set by the middleware when someone is bounced from a
      // page they asked for, so they land where they were going.
      const to = params.get("callbackUrl");
      router.push(to && to.startsWith("/") ? to : home);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again in a moment.");
      setBusy(false);
    }
  }

  return (
    <main className="admin-signin">
      <div className="admin-signin-card">
        <div className="admin-signin-head">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <form className="panel" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="notice notice-error panel-msg">{error}</p>}

          <div className="panel-actions">
            <button className="btn-solid" type="submit" disabled={busy}>
              {busy ? <Spinner label="Signing in" /> : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
