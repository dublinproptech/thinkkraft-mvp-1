"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// Zod's flatten() puts field problems under fieldErrors and whole-form ones
// under formErrors. Pull out the first readable line for the banner.
function firstMessage(error: unknown): string | null {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return null;
  const { fieldErrors, formErrors } = error as {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
  for (const list of Object.values(fieldErrors ?? {})) {
    if (list?.[0]) return list[0];
  }
  return formErrors?.[0] ?? null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // A parent registers here. Children do not: their parent creates each child
  // account from the family dashboard, which is what records consent.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(firstMessage(body?.error) ?? "We could not create that account.");
        setIsLoading(false);
        return;
      }

      // Sign the new parent straight in rather than making them type the same
      // details again, and take them to the page where they add their children.
      const signedIn = await signIn("credentials", {
        usernameOrEmail: email,
        password,
        redirect: false,
      });

      if (signedIn && !signedIn.error) {
        router.push("/parent");
        router.refresh();
        return;
      }

      router.push("/login");
    } catch {
      setError("We could not reach the server. Please try again.");
      setIsLoading(false);
    }
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

      <form
        onSubmit={handleRegister}
        className="panel panel-accent"
        style={{ width: "100%", maxWidth: 400 }}
      >
        <h1 style={{ fontSize: 30, color: "var(--navy)", textAlign: "center", marginBottom: 6 }}>
          Create your account
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--navy)",
            opacity: 0.8,
            margin: "0 0 20px",
          }}
        >
          Parents sign up here. You will add your children on the next screen.
        </p>

        {error && (
          <p className="notice notice-error" style={{ marginBottom: 16 }}>
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>

        <button type="submit" className="btn-ghost" disabled={isLoading} style={{ width: "100%" }}>
          {isLoading ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--navy)" }}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
