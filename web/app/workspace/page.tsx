"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import HintPanel from "./HintPanel";
import AppBar from "../components/AppBar";

function WorkspaceContent() {
  const { data: session, status } = useSession() || { data: null, status: "unauthenticated" };
  const router = useRouter();
  const searchParams = useSearchParams();

  // The Student row id, not the User id. Every studentId foreign key points at
  // this one. It is used here only to decide what to render: the API routes
  // read it from the session themselves and ignore anything the page sends.
  const studentId = session?.user?.studentId;
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
            body: JSON.stringify({ lessonId })
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
    form.append("lessonId", lessonId);

    const res = await fetch("/api/projects", {
      method: "POST",
      body: form,
    }).then((r) => r.json());
    
    if (res.error) {
      setErr(typeof res.error === "string" ? res.error : "That upload was rejected.");
      return;
    }

    setMsg(`Saved. Project id: ${res.project.id}`);
    setSb3Ref(res.project.sb3Ref);
  }

  if (status === "loading") {
    return (
      <>
        <AppBar />
        <main className="shell"><p>Loading workspace...</p></main>
      </>
    );
  }

  if (!studentId) return null;

  return (
    <>
    <AppBar links={[{ href: "/dashboard", label: "My lessons" }]} />
    <main className="shell">
      {toast && (
        <div
          className="panel-flat"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            maxWidth: 340,
            background: toast.type === 'success' ? 'var(--mint)' : 'var(--sky)',
            color: 'var(--navy)',
            fontWeight: 800,
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out forwards',
          }}
        >
          {toast.message}
        </div>
      )}

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

      <div className="page-head">
        <h1>Build your project</h1>
        <p>
          Lesson {lessonId || "not chosen"}
          {isAnalyzing && (
            <span
              style={{
                marginLeft: 10,
                color: "var(--violet)",
                animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            >
              · Milo is looking at your blocks
            </span>
          )}
        </p>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          src="/scratch-editor/index.html"
          width="100%"
          height="700px"
          style={{ border: 'none', display: 'block', backgroundColor: '#fff' }}
          title="ThinkKraft Scratch Editor"
        />
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 19, color: "var(--navy)", marginBottom: 6 }}>
          Save your project
        </h2>
        <p className="muted" style={{ margin: "0 0 14px" }}>
          Use <b>File {'>'} Save to your computer</b> in the editor above, then choose
          that file here.
        </p>
        <input
          type="file"
          accept=".sb3"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div style={{ marginTop: 14 }}>
          <button className="btn-solid" onClick={save}>
            Save project
          </button>
        </div>
        {err && (
          <p className="notice notice-error" style={{ marginTop: 14 }}>
            {err}
          </p>
        )}
        {msg && (
          <p className="notice notice-ok" style={{ marginTop: 14 }}>
            {msg}
          </p>
        )}
      </div>

      {sb3Ref && studentId && lessonId && (
        <HintPanel studentId={studentId} lessonId={lessonId} sb3Ref={sb3Ref} />
      )}
    </main>
    </>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<main className="shell"><p>Loading workspace...</p></main>}>
      <WorkspaceContent />
    </Suspense>
  );
}