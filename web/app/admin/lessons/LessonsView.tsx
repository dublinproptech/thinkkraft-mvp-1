"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import { useList, send } from "../components/useAdmin";
import { Count, Modal, Spinner, TableState } from "../components/ui";

type Lesson = {
  id: string;
  title: string | null;
  goal: string;
  orderNo: number;
  courseId: string;
  course: { id: string; title: string } | null;
  _count: { projects: number; hintEvents: number; studentProgress: number };
};

type Course = { id: string; title: string };

type Form = {
  id: string;
  title: string;
  goal: string;
  orderNo: number;
  courseId: string;
};

export default function LessonsView() {
  const params = useSearchParams();
  const router = useRouter();
  const courseId = params.get("courseId") ?? "";

  const url = courseId
    ? `/api/admin/lessons?courseId=${encodeURIComponent(courseId)}`
    : "/api/admin/lessons";
  const { data, error, loading, reload } = useList<Lesson>(url, "lessons");
  const courses = useList<Course>("/api/admin/courses", "courses");

  const [editing, setEditing] = useState<Lesson | "new" | null>(null);
  const [removing, setRemoving] = useState<Lesson | null>(null);
  const [busy, setBusy] = useState(false);

  const course = useMemo(
    () => courses.data?.find((c) => c.id === courseId) ?? null,
    [courses.data, courseId],
  );

  async function save(form: Form) {
    setBusy(true);
    const isNew = editing === "new";
    const body = {
      ...(isNew ? { id: form.id } : {}),
      title: form.title,
      goal: form.goal,
      orderNo: form.orderNo,
      courseId: form.courseId,
    };
    const ok = await send(
      isNew ? "/api/admin/lessons" : `/api/admin/lessons/${(editing as Lesson).id}`,
      isNew ? "POST" : "PUT",
      body,
      isNew ? "Lesson created." : "Lesson updated.",
    );
    setBusy(false);
    if (ok) {
      setEditing(null);
      await reload();
    }
  }

  async function remove() {
    if (!removing) return;
    setBusy(true);
    const ok = await send(
      `/api/admin/lessons/${removing.id}`,
      "DELETE",
      undefined,
      "Lesson deleted.",
    );
    setBusy(false);
    if (ok) {
      setRemoving(null);
      await reload();
    }
  }

  return (
    <AdminShell
      title={course ? `Lessons in ${course.title}` : "Lessons"}
      description="The steps inside a course, in the order children meet them."
      crumbs={
        course
          ? [
              { label: "Courses", href: "/admin/courses" },
              { label: course.title, href: "/admin/courses" },
            ]
          : []
      }
      actions={
        <button
          className="btn-solid"
          onClick={() => setEditing("new")}
          disabled={!courses.data?.length}
          title={courses.data?.length ? undefined : "Create a course first"}
        >
          New lesson
        </button>
      }
    >
      {/* Filtering by course lives in the URL, so a filtered list can be
          linked to from the courses page and shared. */}
      <div className="panel filter-bar">
        <div className="field filter-field">
          <label htmlFor="filter">Course</label>
          <select
            id="filter"
            className="input"
            value={courseId}
            onChange={(e) => {
              const v = e.target.value;
              router.push(v ? `/admin/lessons?courseId=${encodeURIComponent(v)}` : "/admin/lessons");
            }}
          >
            <option value="">All courses</option>
            {courses.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TableState
        loading={loading}
        error={error}
        empty={!!data && data.length === 0}
        emptyText={
          courses.data?.length
            ? "No lessons in this course yet."
            : "Create a course first, then add lessons to it."
        }
        onRetry={() => void reload()}
      />

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="table-num">#</th>
                <th>Lesson</th>
                <th>Course</th>
                <th>In use by</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id}>
                  <td className="table-num">{l.orderNo}</td>
                  <td>
                    <span className="table-main">{l.title ?? l.goal}</span>
                    <span className="table-sub">{l.id}</span>
                  </td>
                  <td>{l.course?.title ?? l.courseId}</td>
                  <td>
                    <Count n={l._count.projects} one="project" />{" "}
                    <Count n={l._count.hintEvents} one="hint" />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-ghost btn-sm" onClick={() => setEditing(l)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => setRemoving(l)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && courses.data && (
        <LessonForm
          lesson={editing === "new" ? null : editing}
          courses={courses.data}
          defaultCourseId={courseId || courses.data[0]?.id || ""}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      {removing && (
        <Modal
          title={`Delete ${removing.title ?? removing.id}?`}
          note={
            removing._count.projects ||
            removing._count.hintEvents ||
            removing._count.studentProgress
              ? "Children's work is filed against this lesson, so the delete will be refused and nothing will change."
              : "This cannot be undone."
          }
          onClose={() => setRemoving(null)}
        >
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setRemoving(null)} disabled={busy}>
              Cancel
            </button>
            <button className="btn-danger" onClick={() => void remove()} disabled={busy}>
              {busy ? <Spinner label="Deleting" /> : "Delete lesson"}
            </button>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}

function LessonForm({
  lesson,
  courses,
  defaultCourseId,
  busy,
  onCancel,
  onSave,
}: {
  lesson: Lesson | null;
  courses: Course[];
  defaultCourseId: string;
  busy: boolean;
  onCancel: () => void;
  onSave: (v: Form) => void;
}) {
  const [id, setId] = useState(lesson?.id ?? "");
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [goal, setGoal] = useState(lesson?.goal ?? "");
  const [orderNo, setOrderNo] = useState(String(lesson?.orderNo ?? 1));
  const [courseId, setCourseId] = useState(lesson?.courseId ?? defaultCourseId);

  return (
    <Modal
      title={lesson ? "Edit lesson" : "New lesson"}
      note={lesson ? lesson.id : undefined}
      onClose={onCancel}
    >
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            id: id.trim(),
            title: title.trim(),
            goal: goal.trim(),
            orderNo: Number(orderNo),
            courseId,
          });
        }}
      >
        {/* Only on creation. Changing a lesson id later would orphan every
            project and hint already filed against the old one. */}
        {!lesson && (
          <div className="field admin-form-wide">
            <label htmlFor="id">Lesson id</label>
            <input
              id="id"
              className="input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="loops-2"
              pattern="[a-z0-9\-]*"
              maxLength={60}
            />
            <span className="hint">
              Lower-case letters, numbers and hyphens. Leave blank for a
              generated one. This cannot be changed later.
            </span>
          </div>
        )}

        <div className="field">
          <label htmlFor="lesson-title">Title</label>
          <input
            id="lesson-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Repeating with loops"
          />
        </div>

        <div className="field">
          <label htmlFor="orderNo">Lesson number</label>
          <input
            id="orderNo"
            className="input"
            type="number"
            min={1}
            max={999}
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            required
          />
        </div>

        <div className="field admin-form-wide">
          <label htmlFor="courseId">Course</label>
          <select
            id="courseId"
            className="input"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="field admin-form-wide">
          <label htmlFor="goal">Goal</label>
          <textarea
            id="goal"
            className="input"
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
            minLength={4}
            maxLength={500}
          />
          <span className="hint">What the child should be able to do by the end.</span>
        </div>

        <div className="modal-actions admin-form-wide">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-solid" disabled={busy}>
            {busy ? <Spinner label="Saving" /> : lesson ? "Save changes" : "Create lesson"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
