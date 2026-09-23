"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

// The frame every admin page sits in: a rail down the left, breadcrumbs, and
// the page's own heading. Middleware already decides who may be here, so this
// only renders.

const NAV = [
  {
    group: "Curriculum",
    links: [
      { href: "/admin/courses", label: "Courses" },
      { href: "/admin/lessons", label: "Lessons" },
    ],
  },
  {
    group: "People",
    links: [
      { href: "/admin/teachers", label: "Teachers" },
      { href: "/admin/students", label: "Students" },
      { href: "/admin/parents", label: "Parents" },
    ],
  },
];

export type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  /** Buttons for this page, shown beside the heading. */
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function AdminShell({
  title,
  description,
  crumbs = [],
  actions,
  children,
}: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="admin-nav">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="admin-nav-group">{section.group}</p>
          {section.links.map((link) => {
            const on =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={on ? "admin-nav-link admin-nav-link-on" : "admin-nav-link"}
                aria-current={on ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="admin">
      <div className="admin-layout">
        {/* On a narrow screen the rail slides in over the page, so the scrim
            has to be there to close it again. */}
        {open && (
          <div
            className="admin-scrim"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside className={open ? "admin-rail admin-rail-open" : "admin-rail"}>
          <Link href="/admin" className="admin-brand" onClick={() => setOpen(false)}>
            <span className="admin-brand-mark" aria-hidden="true">
              TK
            </span>
            <span className="admin-brand-text">
              ThinkKraft
              <span className="admin-brand-sub">Admin</span>
            </span>
          </Link>

          <Link
            href="/admin"
            className={
              pathname === "/admin"
                ? "admin-nav-link admin-nav-link-on"
                : "admin-nav-link"
            }
            onClick={() => setOpen(false)}
          >
            Overview
          </Link>

          {nav}

          <div className="admin-rail-foot">
            {session?.user?.email && (
              <p className="admin-who">{session.user.email}</p>
            )}
            <button
              className="btn-ghost btn-sm"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <div className="admin-topbar">
            <button
              className="btn-ghost btn-sm"
              onClick={() => setOpen(true)}
              aria-label="Open the menu"
            >
              Menu
            </button>
            <span className="admin-brand-text">ThinkKraft Admin</span>
          </div>

          <main className="admin-content">
            <Breadcrumbs crumbs={crumbs} current={title} />

            <div className="admin-head">
              <div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
              </div>
              {actions && <div className="panel-actions">{actions}</div>}
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// Admin is always the first crumb, and the page you are on is always the last
// and is never a link, so no page has to remember either.
function Breadcrumbs({ crumbs, current }: { crumbs: Crumb[]; current: string }) {
  const all: Crumb[] = [{ label: "Admin", href: "/admin" }, ...crumbs];
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {all.map((c) => (
        <span key={c.label + (c.href ?? "")}>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          <span className="crumbs-sep"> / </span>
        </span>
      ))}
      <span className="crumbs-here" aria-current="page">
        {current}
      </span>
    </nav>
  );
}
