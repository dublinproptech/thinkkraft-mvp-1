import Link from "next/link";
import { listCourses } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await listCourses();
  return (
    <main className="wrap">
      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>
      <span className="badge" style={{ marginTop: 24 }}>
        Phase 1 · courses
      </span>
      <h1 style={{ fontSize: 40, margin: "14px 0 6px", color: "var(--navy)" }}>
        Courses
      </h1>
      <p className="muted" style={{ fontSize: 16 }}>
        Loaded live from the database.
      </p>

      <div className="grid" style={{ marginTop: 24 }}>
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/courses/${c.id}`}
            className="card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h2 style={{ fontSize: 20, color: "var(--navy)" }}>{c.title}</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Ages {c.ageBand}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
