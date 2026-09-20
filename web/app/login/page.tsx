"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    // Changed background to var(--cream) and added flex-col to stack logo and card
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] p-4">
      
      {/* Added Logo above the card */}
      <div className="mb-6 flex flex-col items-center">
        <Image 
          src="/logo.png" 
          alt="ThinkKraft Logo" 
          width={180} 
          height={60} 
          style={{ objectFit: "contain" }} 
        />
      </div>

      <form 
        onSubmit={handleLogin} 
        className="card flex flex-col gap-5 w-full max-w-sm"
        style={{ 
          backgroundColor: 'var(--gold)', 
          border: '2px solid var(--navy)',
          boxShadow: '8px 8px 0 var(--navy)' 
        }}
      >
        {/* Changed "Platform Login" to "Login" and increased font size */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-black" style={{ color: 'var(--navy)' }}>Login</h1>
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