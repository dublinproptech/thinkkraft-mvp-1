import Link from "next/link";
import Image from "next/image";
import { listCourses } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await listCourses();

  return (
    <>
      <header className="appbar">
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/logo.png"
            alt="ThinkKraft"
            width={132}
            height={44}
            style={{ objectFit: "contain" }}
          />
        </Link>
        <div className="appbar-links">
          <Link href="/login" className="btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/register" className="btn-solid btn-sm">
            Register
          </Link>
        </div>
      </header>

      <main className="shell">
        <div className="page-head">
          <h1>Courses</h1>
          <p>What your child can learn with us.</p>
        </div>

        <div className="grid">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="panel"
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <h2 style={{ fontSize: 20, color: "var(--navy)" }}>{c.title}</h2>
              <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                Ages {c.ageBand}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
