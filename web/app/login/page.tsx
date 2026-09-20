"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

// Where each role lands after signing in. Everyone used to be sent to /teacher,
// which bounced children and parents straight back out again.
const HOME: Record<string, string> = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  PARENT: "/parent",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      usernameOrEmail,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("We could not sign you in. Check your details and try again.");
      setIsLoading(false);
      return;
    }

    // Read the session back to find out which role signed in, then send them
    // to their own area. If middleware bounced them here from a protected
    // page, honour that destination instead.
    const session = await getSession();
    const role = session?.user?.role;
    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl || HOME[role ?? ""] || "/");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Link href="/" style={{ marginBottom: 26 }}>
        <Image
          src="/logo.png"
          alt="ThinkKraft"
          width={180}
          height={60}
          style={{ objectFit: "contain" }}
          priority
        />
      </Link>

      <form onSubmit={handleLogin} className="panel panel-accent" style={{ width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontSize: 32, color: "var(--navy)", textAlign: "center", marginBottom: 20 }}>
          Sign in
        </h1>

        {error && (
          <p className="notice notice-error" style={{ marginBottom: 16 }}>
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="identifier">Username or email</label>
          <input
            id="identifier"
            className="input"
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password or PIN</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-ghost" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: 14,
            color: "var(--navy)",
            margin: "18px 0 0",
          }}
        >
          New here?{" "}
          <Link href="/register" style={{ color: "var(--navy)" }}>
            Create a parent account
          </Link>
        </p>
        <p
          style={{
            textAlign: "center",
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--navy)",
            opacity: 0.75,
            margin: "8px 0 0",
          }}
        >
          Children sign in with the username and PIN their parent set up.
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="shell"><p>Loading...</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
