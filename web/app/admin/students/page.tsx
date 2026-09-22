"use client";

import AdminShell from "../components/AdminShell";
import { useList } from "../components/useAdmin";
import { Count, TableState } from "../components/ui";

type Student = {
  id: string;
  displayName: string;
  ageBand: string;
  createdAt: string;
  parent: { id: string; name: string; email: string } | null;
  user: { username: string | null } | null;
  _count: { enrolments: number; projects: number; hintEvents: number };
};

// Read only, deliberately. A child's account belongs to their parent, who
// created it and can change it; an admin removing one from here would be
// reaching into a family's account without them knowing.
export default function StudentsPage() {
  const { data, error, loading, reload } = useList<Student>(
    "/api/admin/students",
    "students",
  );

  return (
    <AdminShell
      title="Students"
      description="Children with accounts. Parents create and manage these."
    >
      <TableState
        loading={loading}
        error={error}
        empty={!!data && data.length === 0}
        emptyText="No children have been registered yet."
        onRetry={() => void reload()}
      />

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Child</th>
                <th>Age band</th>
                <th>Parent</th>
                <th>Work</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="table-main">{s.displayName}</span>
                    <span className="table-sub">
                      {s.user?.username ?? "no sign-in yet"}
                    </span>
                  </td>
                  <td className="table-num">{s.ageBand}</td>
                  <td>
                    {s.parent ? (
                      <>
                        <span className="table-main">{s.parent.name}</span>
                        <span className="table-sub">{s.parent.email}</span>
                      </>
                    ) : (
                      <span className="muted">unknown</span>
                    )}
                  </td>
                  <td>
                    <Count n={s._count.projects} one="project" />{" "}
                    <Count n={s._count.enrolments} one="class" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
