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
    <main className="wrap">
      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>
      <span className="badge" style={{ marginTop: 24 }}>
        Course
      </span>
      <h1 style={{ fontSize: 36, margin: "14px 0 6px", color: "var(--navy)" }}>
        {course.title}
      </h1>
      <p className="muted" style={{ fontSize: 16 }}>
        Ages {course.ageBand} · {course.lessons.length} lessons
      </p>

      <div className="grid" style={{ marginTop: 24 }}>
        {course.lessons.map((l) => (
          <div key={l.id} className="card">
            <div className="badge">Lesson {l.orderNo}</div>
            <p style={{ marginTop: 12, fontWeight: 700 }}>{l.goal}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
