"use client";

import { signOut } from "next-auth/react";

// Signing out clears the session cookie and lands back on the public homepage.
export default function SignOutButton() {
  return (
    <button
      type="button"
      className="btn-danger btn-sm"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}
