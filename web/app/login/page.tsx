"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
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

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/teacher"); 
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sky)] p-4">
      <form 
        onSubmit={handleLogin} 
        className="card flex flex-col gap-5 w-full max-w-sm"
        style={{ 
          backgroundColor: 'var(--gold)', 
          border: '2px solid var(--navy)',
          boxShadow: '8px 8px 0 var(--navy)' 
        }}
      >
        <div className="text-center mb-2">
          <h2 style={{ color: 'var(--navy)' }}>Platform Login</h2>
        </div>
        
        {error && (
          <p className="text-[var(--coral)] text-sm font-bold text-center">
            {error}
          </p>
        )}
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-bold" style={{ color: 'var(--navy)' }}>
            Username or Email
          </label>
          <input
            type="text"
            className="w-full rounded-[var(--radius)] border-2 border-[var(--navy)] bg-[var(--cream)] p-3 text-[var(--ink)] placeholder-[var(--muted)] focus:border-[var(--violet)] focus:outline-none"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-bold" style={{ color: 'var(--navy)' }}>
            Password or PIN
          </label>
          <input
            type="password"
            className="w-full rounded-[var(--radius)] border-2 border-[var(--navy)] bg-[var(--cream)] p-3 text-[var(--ink)] placeholder-[var(--muted)] focus:border-[var(--violet)] focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn mt-2 w-full disabled:opacity-50"
          style={{ 
            backgroundColor: 'var(--paper)', 
            color: 'var(--navy)',
            border: '2px solid var(--navy)',
            boxShadow: '0 4px 0 var(--navy)'
          }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}