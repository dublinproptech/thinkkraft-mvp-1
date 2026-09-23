"use client";

import { useState } from "react";
import AdminShell from "../components/AdminShell";
import { useList, send } from "../components/useAdmin";
import { Count, Modal, Spinner, TableState } from "../components/ui";

type Teacher = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  user: { id: string; email: string | null } | null;
  _count: { cohorts: number; approvedHints: number };
};

type Form = { name: string; email: string; password: string };

export default function TeachersPage() {
  const { data, error, loading, reload } = useList<Teacher>(
    "/api/admin/teachers",
    "teachers",
  );
  const [editing, setEditing] = useState<Teacher | "new" | null>(null);
  const [removing, setRemoving] = useState<Teacher | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(form: Form) {
    setBusy(true);
    const isNew = editing === "new";
    const ok = await send(
      isNew ? "/api/admin/teachers" : `/api/admin/teachers/${(editing as Teacher).id}`,
      isNew ? "POST" : "PUT",
      // An empty password on an edit means leave the existing one alone.
      isNew ? form : { name: form.name, email: form.email, password: form.password },
      isNew ? "Teacher created." : "Teacher updated.",
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
      `/api/admin/teachers/${removing.id}`,
      "DELETE",
      undefined,
      "Teacher removed.",
    );
    setBusy(false);
    if (ok) {
      setRemoving(null);
      await reload();
    }
  }

  return (
    <AdminShell
      title="Teachers"
      description="Teachers approve every AI hint before a child sees it."
      actions={
        <button className="btn-solid" onClick={() => setEditing("new")}>
          New teacher
        </button>
      }
    >
      <TableState
        loading={loading}
        error={error}
        empty={!!data && data.length === 0}
        emptyText="No teachers yet. Until there is one, no hint can reach a child."
        onRetry={() => void reload()}
      />

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Can sign in</th>
                <th>Activity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="table-main">{t.name}</span>
                    <span className="table-sub">{t.email}</span>
                  </td>
                  <td>
                    {/* A Teacher row can exist from seeding with no account
                        pointing at it, in which case nobody can sign in as
                        them and no hint of theirs can be approved. */}
                    <span className={t.user ? "pill pill-on" : "pill"}>
                      {t.user ? "Yes" : "No account"}
                    </span>
                  </td>
                  <td>
                    <Count n={t._count.cohorts} one="class" />{" "}
                    <Count n={t._count.approvedHints} one="reviewed hint" />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-ghost btn-sm" onClick={() => setEditing(t)}>
                        Edit
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => setRemoving(t)}>
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
        <TeacherForm
          teacher={editing === "new" ? null : editing}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      {removing && (
        <Modal
          title={`Remove ${removing.name}?`}
          note={
            removing._count.approvedHints || removing._count.cohorts
              ? "This teacher is part of the record of what reached a child, so the delete will be refused and nothing will change."
              : "Their sign-in account goes too. This cannot be undone."
          }
          onClose={() => setRemoving(null)}
        >
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setRemoving(null)} disabled={busy}>
              Cancel
            </button>
            <button className="btn-danger" onClick={() => void remove()} disabled={busy}>
              {busy ? <Spinner label="Removing" /> : "Remove teacher"}
            </button>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}

function TeacherForm({
  teacher,
  busy,
  onCancel,
  onSave,
}: {
  teacher: Teacher | null;
  busy: boolean;
  onCancel: () => void;
  onSave: (v: Form) => void;
}) {
  const [name, setName] = useState(teacher?.name ?? "");
  const [email, setEmail] = useState(teacher?.email ?? "");
  const [password, setPassword] = useState("");

  return (
    <Modal
      title={teacher ? "Edit teacher" : "New teacher"}
      note={
        teacher
          ? "Leave the password blank to keep the current one."
          : "This creates the account they sign in with at /teacher/login."
      }
      onClose={onCancel}
    >
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ name: name.trim(), email: email.trim().toLowerCase(), password });
        }}
      >
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field admin-form-wide">
          <label htmlFor="password">
            {teacher ? "New password" : "Password"}
          </label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!teacher}
            minLength={teacher ? 0 : 8}
            placeholder={teacher ? "Leave blank to keep the current one" : ""}
          />
          <span className="hint">At least 8 characters.</span>
        </div>

        <div className="modal-actions admin-form-wide">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn-solid" disabled={busy}>
            {busy ? (
              <Spinner label="Saving" />
            ) : teacher ? (
              "Save changes"
            ) : (
              "Create teacher"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
