"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

// The session is read on the server and handed down, so useSession() already
// has an answer on the very first render. Without it the app bar renders
// signed-out for a moment and the name and role pop in after hydration.
export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}