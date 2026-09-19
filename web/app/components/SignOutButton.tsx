"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn"
      style={{
        backgroundColor: "var(--coral)",
        color: "var(--white)",
        border: "2px solid var(--navy)",
        boxShadow: "0 4px 0 var(--navy)",
        padding: "8px 16px",
        borderRadius: "var(--radius)",
        fontWeight: "bold"
      }}
    >
      Sign Out
    </button>
  );
}