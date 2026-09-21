import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCourseWithLessons } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseWithLessons(id);
  if (!course) notFound();

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
          <Link href="/courses" className="btn-ghost btn-sm">
            All courses
          </Link>
          <Link href="/register" className="btn-solid btn-sm">
            Register
          </Link>
        </div>
      </header>

      <main className="shell">
        <div className="page-head">
          <h1>{course.title}</h1>
          <p>
            Ages {course.ageBand} · {course.lessons.length} lesson
            {course.lessons.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid">
          {course.lessons.map((l) => (
            <div key={l.id} className="panel">
              <div className="badge">Lesson {l.orderNo}</div>
              <p style={{ marginTop: 12, marginBottom: 0, fontWeight: 700, lineHeight: 1.5 }}>
                {l.goal}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
