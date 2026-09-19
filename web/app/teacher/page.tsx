"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define the shape of our Hint data
type Hint = {
  id: string;
  studentId: string;
  lessonId: string;
  diagnosis: string;
  text: string;
  status: string;
};

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingHints, setPendingHints] = useState<Hint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Security Check: Only let Teachers in!
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "TEACHER") {
      router.push("/");
    }
  }, [status, session, router]);

  // Fetch pending hints (You can also move this to a standard API route later)
  useEffect(() => {
    const fetchPendingHints = async () => {
      try {
        // Fetching directly via a quick API call (You'll need to create this GET route, 
        // or we can use Server Actions. For now, assuming you have a GET route!)
        const res = await fetch("/api/hints?status=PENDING"); 
        if (res.ok) {
          const data = await res.json();
          // Filter to only show proactive hints
          const proactiveHints = data.hints.filter((h: Hint) => h.diagnosis.startsWith("proactive:"));
          setPendingHints(proactiveHints);
        }
      } catch (error) {
        console.error("Failed to fetch hints:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.role === "TEACHER") {
      fetchPendingHints();
    }
  }, [session]);

  const handleReview = async (hintId: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/hints/${hintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Remove the hint from the screen once reviewed
        setPendingHints((prev) => prev.filter((h) => h.id !== hintId));
      }
    } catch (error) {
      console.error("Error updating hint:", error);
    }
  };

  if (status === "loading" || isLoading) return <main className="wrap"><p>Loading dashboard...</p></main>;
  if (session?.user?.role !== "TEACHER") return null;

  return (
    <main className="wrap">
      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>
      <span className="badge" style={{ marginTop: 24, backgroundColor: 'var(--purple)', color: 'white' }}>
        Teacher Portal
      </span>
      
      <h1 style={{ fontSize: 34, margin: "14px 0 24px", color: "var(--navy)" }}>
        Proactive Hint Approvals
      </h1>

      {pendingHints.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <h3 style={{ color: "var(--navy)" }}>All caught up! 🎉</h3>
          <p className="muted">No students currently need proactive assistance.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {pendingHints.map((hint) => (
            <div key={hint.id} className="card" style={{ borderLeft: "4px solid var(--blue)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", color: "var(--navy)" }}>
                    Student: {hint.studentId}
                  </h3>
                  <p className="muted" style={{ margin: "0 0 4px", fontSize: "14px" }}>
                    <b>Lesson:</b> {hint.lessonId}
                  </p>
                  <p className="muted" style={{ margin: "0 0 16px", fontSize: "14px" }}>
                    <b>AI Diagnosis:</b> {hint.diagnosis.replace("proactive:", "")}
                  </p>
                  
                  <div style={{ backgroundColor: "#F3F4F6", padding: "12px", borderRadius: "6px" }}>
                    <b>Proposed Hint:</b> "{hint.text}"
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                  <button 
                    onClick={() => handleReview(hint.id, "APPROVED")}
                    className="btn btn-primary"
                    style={{ backgroundColor: "#10B981", color: "white", minWidth: "100px" }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReview(hint.id, "REJECTED")}
                    className="btn"
                    style={{ backgroundColor: "#FEE2E2", color: "#DC2626", minWidth: "100px", border: "none" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}