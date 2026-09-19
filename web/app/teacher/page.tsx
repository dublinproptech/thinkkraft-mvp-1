import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route"; // Adjust this path to match where your authOptions is defined
import SignOutButton from "../components/SignOutButton";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import ApproveButton from "./ApproveButton";

// Initialize the Prisma 7 Driver Adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }); // Using the Next.js path alias to avoid dot-path confusion

export default async function TeacherConsole() {
  // 1. Get identity securely from the server session
  const session = await getServerSession(authOptions);

  // 2. Protect the route: Kick them to login if they are not an authenticated TEACHER
  if (!session || session.user?.role !== "TEACHER") {
    redirect("/login");
  }

  // 3. Grab the actual teacher ID from the session
  const teacherId = session.user.id;

  // Fetch real "PROPOSED" hints directly from the database
  const pendingHints = await prisma.hintEvent.findMany({
    where: {
      status: "PROPOSED",
      // Note: Once your Cohort data is seeded, you can add a filter here so `teacherId` 
      // only sees hints from students enrolled in their specific cohorts!
    },
    include: {
      student: true, // Joins the Student table to get their name
      lesson: {
        include: {
          course: true, // Joins Course to get the subject context
        },
      },
    },
  });

  return (
    <div className="wrap">
      <header
        style={{
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div className="badge" style={{ marginBottom: "12px" }}>
            Phase 4 • Teacher UI
          </div>
          <h1 style={{ color: "var(--navy)" }}>Teacher Dashboard</h1>
          <p className="muted" style={{ marginTop: "8px" }}>
            Review and approve pending hint requests from students.
          </p>
          <p style={{ marginTop: "4px", fontSize: "14px", fontWeight: "bold", color: "var(--violet)" }}>
            Welcome, Teacher {teacherId}
          </p>
        </div>
        
        {/* 4. Drop in the new Sign Out button */}
        <SignOutButton />
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {pendingHints.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <p className="muted">No pending hint requests right now! 🎉</p>
          </div>
        ) : (
          pendingHints.map((hint) => (
            <div
              key={hint.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h2
                  style={{
                    color: "var(--violet)",
                    marginBottom: "12px",
                    fontSize: "1.5rem",
                  }}
                >
                  {hint.student.displayName}
                </h2>

                <div className="status" style={{ marginBottom: "8px" }}>
                  <div className="dot wait"></div>
                  {/* Combines Course Title and Lesson Goal for context */}
                  <span>
                    {hint.lesson.course.title} - {hint.lesson.goal}
                  </span>
                </div>

                <p style={{ margin: 0, color: "var(--ink)" }}>
                  <span className="muted">Requested Hint: </span>
                  {hint.text}
                </p>
              </div>

              <ApproveButton hintId={hint.id} />
            </div>
          ))
        )}
      </main>
    </div>
  );
}