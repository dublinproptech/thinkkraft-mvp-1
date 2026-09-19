"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import HintPanel from "./HintPanel";

function WorkspaceContent() {
  const { data: session, status } = useSession() || { data: null, status: "unauthenticated" };
  const router = useRouter();
  const searchParams = useSearchParams();

  const studentId = session?.user?.id;
  const role = session?.user?.role;
  const lessonId = searchParams.get("lessonId") || ""; 

  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sb3Ref, setSb3Ref] = useState<string | null>(null);

  // --- NEW: UI/UX STATE ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'info' | 'success' } | null>(null);

  // Helper to trigger a toast that auto-hides after 4 seconds
  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleIframeMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'PROJECT_SAVED') {
        if (!studentId || !lessonId) return;

        setIsAnalyzing(true); // Turn on the loader!

        try {
          const res = await fetch('/api/hints/proactive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, lessonId })
          });
          
          const data = await res.json();
          
          if (data.created && data.created.length > 0) {
             // Turn off loader and show success toast!
             setIsAnalyzing(false);
             showToast("AI noticed you might be stuck! Hint sent to your teacher for approval.", "success");
          } else {
             // Silently finish if no hint was needed
             setIsAnalyzing(false);
          }
          
        } catch (error) {
          console.error("Proactive check failed:", error);
          setIsAnalyzing(false);
        }
      }
    };

    window.addEventListener('message', handleIframeMessage);

    const syncInterval = setInterval(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'REQUEST_SAVE' }, '*');
      }
    }, 30000); 

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      clearInterval(syncInterval);
    };
  }, [studentId, lessonId]); 

  // Security Check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && role !== "STUDENT") {
      router.push("/");
    }
  }, [status, role, router]);

  async function save() {
    setErr(null);
    setMsg(null);
    
    if (!studentId || !lessonId) {
      setErr("Missing student or lesson information.");
      return;
    }
    if (!file) {
      setErr("Choose your saved .sb3 file first.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("studentId", studentId);
    form.append("lessonId", lessonId);

    const res = await fetch("/api/projects", {
      method: "POST",
      body: form,
    }).then((r) => r.json());
    
    if (res.error) {
      setErr(res.error);
      return;
    }
    
    setMsg(`Saved. Project id: ${res.project.id}`);
    setSb3Ref(res.project.sb3Ref);
  }

  if (status === "loading") {
    return <main className="wrap"><p>Loading workspace...</p></main>;
  }

  if (!studentId) return null;

  return (
    <main className="wrap">
      {/* NEW: Floating Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '16px 24px',
          backgroundColor: toast.type === 'success' ? '#10B981' : '#3B82F6',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          fontWeight: 600,
          zIndex: 9999,
          transition: 'all 0.3s ease-in-out',
          animation: 'slideIn 0.3s ease-out forwards'
        }}>
          {toast.message}
        </div>
      )}

      {/* Inline animation styles for the toast */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div className="brand">
        <span className="mark">✦</span> ThinkKraft <small>.ai</small>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
        <span className="badge">Phase 6 · workspace</span>
        
        {/* NEW: Subtle Loader Indicator */}
        {isAnalyzing && (
          <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500, animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            ⚡ AI is analyzing blocks...
          </span>
        )}
      </div>

      <h1 style={{ fontSize: 34, margin: "14px 0 6px", color: "var(--navy)" }}>
        Build your project
      </h1>
      <p className="muted" style={{ fontSize: 15 }}>
        Student {studentId} · lesson {lessonId || "?"}
      </p>

      <div className="card" style={{ marginTop: 10, padding: 0, overflow: 'hidden', border: '2px solid var(--line)' }}>
        <iframe
          ref={iframeRef} 
          src="/scratch-editor/index.html"
          width="100%"
          height="700px"
          style={{ border: 'none', display: 'block', backgroundColor: '#fff' }}
          title="ThinkKraft Scratch Editor"
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, color: "var(--navy)" }}>Manual Upload (Backup)</h2>
        <p className="muted" style={{ margin: "8px 0 12px" }}>
          Use <b>File {'>'} Save to your computer</b> in the editor above, then upload the .sb3 file here.
        </p>
        <input
          type="file"
          accept=".sb3"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={save}>
            Save project
          </button>
        </div>
        {err && (
          <p style={{ color: "var(--coral)", fontWeight: 700, marginTop: 14 }}>
            {err}
          </p>
        )}
        {msg && (
          <p style={{ color: "var(--navy)", fontWeight: 700, marginTop: 14 }}>
            {msg}
          </p>
        )}
      </div>

      {sb3Ref && studentId && lessonId && (
        <HintPanel studentId={studentId} lessonId={lessonId} sb3Ref={sb3Ref} />
      )}
    </main>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<main className="wrap"><p>Loading workspace...</p></main>}>
      <WorkspaceContent />
    </Suspense>
  );
}