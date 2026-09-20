"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";

// The bar across the top of every signed-in page: brand, who you are, where
// else you can go, and the way out. One component so the header cannot drift
// from page to page, and so "sign out" is never the thing someone forgot.

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  PARENT: "Parent",
};

const ROLE_CLASS: Record<string, string> = {
  STUDENT: "rolechip rolechip-student",
  TEACHER: "rolechip rolechip-teacher",
  PARENT: "rolechip rolechip-parent",
};

// Where each role's own home lives, used for the brand link.
const HOME: Record<string, string> = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  PARENT: "/parent",
};

type Props = {
  /** Extra links for this page, rendered before the sign-out button. */
  links?: { href: string; label: string }[];
};

export default function AppBar({ links = [] }: Props) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const name = session?.user?.name ?? session?.user?.email ?? null;

  return (
    <header className="appbar">
      <Link
        href={HOME[role] ?? "/"}
        style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
      >
        <Image
          src="/logo.png"
          alt="ThinkKraft"
          width={132}
          height={44}
          style={{ objectFit: "contain" }}
          priority
        />
      </Link>

      <div className="appbar-links">
        {role && (
          <span className={ROLE_CLASS[role] ?? "rolechip"}>
            {ROLE_LABEL[role] ?? role}
            {name ? ` · ${name}` : ""}
          </span>
        )}

        {links.map((l) => (
          <Link key={l.href} href={l.href} className="btn-ghost btn-sm">
            {l.label}
          </Link>
        ))}

        <SignOutButton />
      </div>
    </header>
  );
}
