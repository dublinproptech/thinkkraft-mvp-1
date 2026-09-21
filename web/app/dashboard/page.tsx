"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppBar from "../components/AppBar";

type Lesson = {
  id: string;
  orderNo: number;
  goal: string;
  completed: boolean;
};

type Course = { id: string; title: string; schedule: string } | null;

// Where a child lands after signing in. The lessons are the real ones from the
// course their parent enrolled them in, so the links actually open something.
export default function StudentDashboard() {
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/my/lessons");
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        setLessons(data.lessons ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    return () => clearTimeout(first);
  }, [load]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <>
      <AppBar />

      <main className="shell">
        <div className="page-head">
          <h1>Hi {firstName}</h1>
          <p>
            {course
              ? `${course.title} · ${course.schedule}`
              : "Pick a lesson to open your workspace."}
          </p>
        </div>

        {loading ? (
          <div className="panel empty">
            <p>Loading your lessons...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="panel empty">
            <h3>No lessons yet</h3>
            <p>
              You are not in a class yet. Ask your parent or teacher to add you to
              one, then come back here.
            </p>
          </div>
        ) : (
          <section className="grid">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="panel"
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div className="status">
                  <div className={`dot ${lesson.completed ? "ok" : "wait"}`} />
                  <span style={{ fontSize: 18, color: "var(--navy)" }}>
                    {lesson.orderNo}. {titleFor(lesson.id)}
                  </span>
                </div>

                <p className="muted" style={{ margin: 0, lineHeight: 1.5, flexGrow: 1 }}>
                  {lesson.goal}
                </p>

                <Link
                  href={`/workspace?lessonId=${encodeURIComponent(lesson.id)}`}
                  className="btn-solid"
                  style={{ width: "100%" }}
                >
                  {lesson.completed ? "Open again" : "Start lesson"}
                </Link>
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

// Lesson ids read like "loops-1". Turn that into something a child sees as a
// title until the schema carries one of its own.
function titleFor(lessonId: string) {
  const base = lessonId.replace(/-\d+$/, "").replace(/[-_]/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}
