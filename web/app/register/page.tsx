"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // The API route will hardcode the role to "STUDENT" for this form.
    // Simulating loading state and redirect for now.
    setTimeout(() => {
      setIsLoading(false);
      router.push("/login");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] p-4">
      
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <Link href="/">
          <Image 
            src="/logo.png" 
            alt="ThinkKraft Logo" 
            width={180} 
            height={60} 
            style={{ objectFit: "contain" }} 
          />
        </Link>
      </div>

      <form 
        onSubmit={handleRegister}
        className="card flex flex-col gap-4 w-full max-w-sm" 
        style={{ 
          backgroundColor: 'var(--gold)', 
          border: '2px solid var(--navy)', 
          boxShadow: '8px 8px 0 var(--navy)',
          padding: '32px'
        }}
      >
        <div className="text-center mb-2">
          <h1 className="text-3xl font-black" style={{ color: 'var(--navy)' }}>Student Registration</h1>
        </div>
        
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-bold" style={{ color: 'var(--navy)' }}>Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-[var(--radius)] border-2 border-[var(--navy)] bg-[var(--cream)] p-3 text-[var(--ink)] placeholder-[var(--muted)] focus:border-[var(--violet)] focus:outline-none" 
          />
        </div>

        {/* Email or Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-bold" style={{ color: 'var(--navy)' }}>Email or Username</label>
          <input 
            type="text" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-[var(--radius)] border-2 border-[var(--navy)] bg-[var(--cream)] p-3 text-[var(--ink)] placeholder-[var(--muted)] focus:border-[var(--violet)] focus:outline-none" 
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5 mb-2">
          <label className="text-[14px] font-bold" style={{ color: 'var(--navy)' }}>Password or PIN</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-[var(--radius)] border-2 border-[var(--navy)] bg-[var(--cream)] p-3 text-[var(--ink)] placeholder-[var(--muted)] focus:border-[var(--violet)] focus:outline-none" 
          />
        </div>

        {/* Submit Button */}
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        {/* Link back to login */}
        <p className="text-center text-sm font-bold text-[var(--navy)] mt-4">
          Already have an account? <Link href="/login" className="underline decoration-2 underline-offset-2">Sign in</Link>
        </p>
      </form>
    </div>
  );
}