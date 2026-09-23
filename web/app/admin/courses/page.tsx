"use client";

import Link from "next/link";
import { useState } from "react";
import AdminShell from "../components/AdminShell";
import { useList, send } from "../components/useAdmin";
import { Count, Modal, Spinner, TableState } from "../components/ui";

type Course = {
  id: string;
  title: string;
  ageBand: string;
  _count: { lessons: number; cohorts: number };
};

const AGE_BANDS = ["9-10", "11-13", "9-13"];

export default function CoursesPage() {
  const { data, error, loading, reload } = useList<Course>(
    "/api/admin/courses",
    "courses",
  );
  const [editing, setEditing] = useState<Course | "new" | null>(null);
  const [removing, setRemoving] = useState<Course | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(form: { title: string; ageBand: string }) {
    setBusy(true);
    const isNew = editing === "new";
    const ok = await send(
      isNew ? "/api/admin/courses" : `/api/admin/courses/${(editing as Course).id}`,
      isNew ? "POST" : "PUT",
      form,
      isNew ? "Course created." : "Course updated.",
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
    // A 409 comes back naming what still points at the course. send() shows it
    // as a toast, so the admin is told which lessons are in the way.
    const ok = await send(
      `/api/admin/courses/${removing.id}`,
      "DELETE",
      undefined,
      "Course deleted.",
    );
    setBusy(false);
    if (ok) {
      setRemoving(null);
      await reload();
    }
  }

  return (
    <AdminShell
      title="Courses"
      description="What a class works through, and the lessons inside it."
      actions={
        <button className="btn-solid" onClick={() => setEditing("new")}>
          New course
        </button>
      }
    >
      <TableState
        loading={loading}
        error={error}
        empty={!!data && data.length === 0}
        emptyText="Create a course, then add lessons to it."
        onRetry={() => void reload()}
      />

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Age band</th>
                <th>Contents</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="table-main">{c.title}</span>
                    <span className="table-sub">{c.id}</span>
                  </td>
                  <td className="table-num">{c.ageBand}</td>
                  <td>
                    <Count n={c._count.lessons} one="lesson" />{" "}
                    <Count n={c._count.cohorts} one="class" />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        href={`/admin/lessons?courseId=${c.id}`}
                        className="btn-ghost btn-sm"
                      >
                        Lessons
                      </Link>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => setEditing(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => setRemoving(c)}
                      >
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

      {editing && (
        <CourseForm
          course={editing === "new" ? null : editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      {removing && (
        <Modal
          title={`Delete ${removing.title}?`}
          note={
            removing._count.lessons || removing._count.cohorts
              ? "This course still has things inside it, so the delete will be refused and nothing will change."
              : "This cannot be undone."
          }
          onClose={() => setRemoving(null)}
        >
          <div className="modal-actions">
            <button
              className="btn-ghost"
              onClick={() => setRemoving(null)}
              disabled={busy}
            >
              Cancel
            </button>
            <button className="btn-danger" onClick={() => void remove()} disabled={busy}>
              {busy ? <Spinner label="Deleting" /> : "Delete course"}
            </button>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}

function CourseForm({
  course,
  busy,
  onCancel,
  onSave,
}: {
  course: Course | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (v: { title: string; ageBand: string }) => void;
}) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [ageBand, setAgeBand] = useState(course?.ageBand ?? AGE_BANDS[0]);

  return (
    <Modal
      title={course ? "Edit course" : "New course"}
      note={course ? course.id : undefined}
      onClose={onCancel}
    >
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ title: title.trim(), ageBand });
        }}
      >
        <div className="field admin-form-wide">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={2}
            maxLength={120}
          />
        </div>

        <div className="field admin-form-wide">
          <label htmlFor="ageBand">Age band</label>
          <select
            id="ageBand"
            className="input"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value)}
          >
            {AGE_BANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions admin-form-wide">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-solid" disabled={busy}>
            {busy ? <Spinner label="Saving" /> : course ? "Save changes" : "Create course"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
