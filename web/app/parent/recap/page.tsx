import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppBar from "../../components/AppBar";

// A child's week, for their own parent.
//
// This page used to call prisma.student.findFirst() with no filter, which
// showed whoever happened to be first in the table: another family's child as
// often as your own. It now reads the parent from the session and will only
// ever load a child belonging to them.
export default async function WeeklyRecapPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const parentId = session?.user?.parentId;

  // middleware.ts keeps non-parents off /parent/*, so this is a backstop.
  if (!parentId) redirect("/login");

  const { studentId } = await searchParams;

  const student = await prisma.student.findFirst({
    // parentId is part of the lookup, not a check afterwards: a studentId from
    // another family simply does not match.
    where: { parentId, ...(studentId ? { id: studentId } : {}) },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: {
          projects: true,
          hintEvents: { where: { status: { in: ["APPROVED", "DELIVERED"] } } },
        },
      },
      skills: {
        where: { level: { in: ["LEARNING", "PRACTISING"] } },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!student) {
    return (
      <>
        <AppBar links={[{ href: "/parent", label: "Your family" }]} />
        <main className="shell">
          <div className="page-head">
            <h1>Weekly recap</h1>
          </div>
          <div className="panel empty">
            <h3>Nothing to show yet</h3>
            <p style={{ marginBottom: 18 }}>
              {studentId
                ? "We could not find that child in your family."
                : "Add a child to start seeing their progress here."}
            </p>
            <Link href="/parent" className="btn-solid">
              Go to your family
            </Link>
          </div>
        </main>
      </>
    );
  }

  const currentFocus = student.skills[0]?.skill ?? "Foundational concepts";

  return (
    <>
      <AppBar links={[{ href: "/parent", label: "Your family" }]} />

      <main className="shell">
        <div className="page-head">
          <h1>{student.displayName}&apos;s week</h1>
          <p>Here is how {student.displayName} has been getting on.</p>
        </div>

        <section className="grid" style={{ marginBottom: 22 }}>
          <div className="panel" style={{ textAlign: "center" }}>
            <span
              style={{ fontSize: 46, fontWeight: 800, color: "var(--violet)", lineHeight: 1 }}
            >
              {student._count.projects}
            </span>
            <div className="muted" style={{ marginTop: 10 }}>
              Projects saved
            </div>
          </div>

          <div className="panel" style={{ textAlign: "center" }}>
            <span
              style={{ fontSize: 46, fontWeight: 800, color: "var(--navy)", lineHeight: 1 }}
            >
              {student._count.hintEvents}
            </span>
            <div className="muted" style={{ marginTop: 10 }}>
              Hints received
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="badge" style={{ marginBottom: 14 }}>
            Current focus
          </div>
          <h2 style={{ color: "var(--navy)", marginBottom: 12 }}>{currentFocus}</h2>
          <p style={{ lineHeight: 1.6, margin: 0 }}>
            {student.displayName} is working on <strong>{currentFocus}</strong>. Every
            hint the AI tutor offered was read and approved by their teacher before
            {student.displayName} saw it.
          </p>
        </section>
      </main>
    </>
  );
}
