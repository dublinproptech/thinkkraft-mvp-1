"use client";

import Link from "next/link";
import AdminShell from "./components/AdminShell";
import { useOne } from "./components/useAdmin";
import { Skeleton } from "./components/ui";

type Stats = {
  courses: number;
  lessons: number;
  teachers: number;
  students: number;
  parents: number;
  pendingHints: number;
};

export default function AdminOverview() {
  const { data: stats, error, loading, reload } = useOne<Stats>(
    "/api/admin/stats",
    "stats",
  );

  const tiles: { label: string; value: number; href?: string; accent?: boolean }[] = [
    { label: "Courses", value: stats?.courses ?? 0, href: "/admin/courses" },
    { label: "Lessons", value: stats?.lessons ?? 0, href: "/admin/lessons" },
    { label: "Teachers", value: stats?.teachers ?? 0, href: "/admin/teachers" },
    { label: "Students", value: stats?.students ?? 0, href: "/admin/students" },
    { label: "Parents", value: stats?.parents ?? 0, href: "/admin/parents" },
    // Not an admin's to approve, but worth knowing whether anything is waiting.
    { label: "Hints awaiting a teacher", value: stats?.pendingHints ?? 0, accent: true },
  ];

  return (
    <AdminShell
      title="Overview"
      description="Courses, lessons and the people using them."
    >
      {loading && <Skeleton rows={2} />}

      {error && (
        <div className="panel empty">
          <h3>That did not load</h3>
          <p>{error}</p>
          <div className="panel-actions">
            <button className="btn-solid btn-sm" onClick={() => void reload()}>
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="admin-stats">
            {tiles.map((t) =>
              t.href ? (
                <Link
                  key={t.label}
                  href={t.href}
                  className={t.accent ? "stat stat-accent" : "stat"}
                >
                  <div className="stat-value">{t.value}</div>
                  <div className="stat-label">{t.label}</div>
                </Link>
              ) : (
                <div
                  key={t.label}
                  className={t.accent ? "stat stat-accent" : "stat"}
                >
                  <div className="stat-value">{t.value}</div>
                  <div className="stat-label">{t.label}</div>
                </div>
              ),
            )}
          </div>

          <div className="panel">
            <h2 className="panel-title">What an admin can change</h2>
            <p className="muted panel-note">
              Courses, lessons and teacher accounts. Students and parents are
              listed here but are created by the families themselves, through
              registration and enrolment.
            </p>
            <p className="muted panel-note">
              Hint approval stays with teachers. Nothing on this panel puts a
              hint in front of a child.
            </p>
          </div>
        </>
      )}
    </AdminShell>
  );
}
