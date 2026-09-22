"use client";

import AdminShell from "../components/AdminShell";
import { useList } from "../components/useAdmin";
import { Count, TableState } from "../components/ui";

type Parent = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  students: { id: string; displayName: string }[];
  _count: { students: number; consents: number };
};

// Read only. A parent account is the one that holds consent for their
// children, so it is not an administrator's to edit or remove.
export default function ParentsPage() {
  const { data, error, loading, reload } = useList<Parent>(
    "/api/admin/parents",
    "parents",
  );

  return (
    <AdminShell
      title="Parents"
      description="Accounts that hold consent for the children on the platform."
    >
      <TableState
        loading={loading}
        error={error}
        empty={!!data && data.length === 0}
        emptyText="No parents have registered yet."
        onRetry={() => void reload()}
      />

      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Parent</th>
                <th>Children</th>
                <th>Consent</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="table-main">{p.name}</span>
                    <span className="table-sub">{p.email}</span>
                  </td>
                  <td>
                    {p.students.length ? (
                      <span className="table-main">
                        {p.students.map((s) => s.displayName).join(", ")}
                      </span>
                    ) : (
                      <span className="muted">none yet</span>
                    )}
                  </td>
                  <td>
                    <Count n={p._count.consents} one="record" />
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
