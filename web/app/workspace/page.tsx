"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import HintPanel from "./HintPanel";
import AppBar from "../components/AppBar";

// What the editor sends back when asked for the child's project.
type Sb3Reply = { buffer?: ArrayBuffer; error?: string };

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

  // --- NEW: UI/UX STATE ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'info' | 'success' } | null>(null);

  // Helper to trigger a toast that auto-hides after 4 seconds
  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Requests for the editor's project, waiting on their reply. The editor
  // answers with the requestId it was given, so two overlapping requests cannot
  // be confused for each other.
  const sb3Waiters = useRef<Map<string, (r: Sb3Reply) => void>>(new Map());

  // Ask the editor to zip up what the child has on screen, then store it.
  //
  // This is what makes "check my work" work without the child exporting a file
  // by hand: the VM can serialise itself, so the hint is about the blocks that
  // are actually there right now. Returns the stored project's ref, or null.
  async function captureProject(): Promise<string | null> {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !lessonId) return null;

    const requestId = crypto.randomUUID();
    const reply = await new Promise<Sb3Reply | null>((resolve) => {
      sb3Waiters.current.set(requestId, resolve);
      // The editor may still be booting, and a child should not be left
      // waiting on a promise that never settles.
      const timeout = setTimeout(() => {
        sb3Waiters.current.delete(requestId);
        resolve(null);
      }, 15000);
      sb3Waiters.current.set(requestId, (r) => {
        clearTimeout(timeout);
        resolve(r);
      });
      frame.postMessage({ type: "REQUEST_SB3", requestId }, window.location.origin);
    });

    if (!reply || reply.error || !reply.buffer) return null;

    const form = new FormData();
    form.append("file", new Blob([reply.buffer]), "project.sb3");
    form.append("lessonId", lessonId);
    const res = await fetch("/api/projects", { method: "POST", body: form })
      .then((r) => r.json())
      .catch(() => null);

    if (!res || res.error) return null;
    return res.project.sb3Ref as string;
  }

  useEffect(() => {
    const handleIframeMessage = async (event: MessageEvent) => {
      // The editor is served from this same origin, so anything from elsewhere
      // is not our editor. This is the only thing standing between a child's
      // activity feed and any other page that can reach this window.
      if (event.origin !== window.location.origin) return;

      // The editor handing back a project we asked for.
      if (event.data && event.data.type === 'PROJECT_SB3') {
        const waiter = sb3Waiters.current.get(event.data.requestId);
        if (waiter) {
          sb3Waiters.current.delete(event.data.requestId);
          waiter({ buffer: event.data.buffer, error: event.data.error });
        }
        return;
      }

      // Live activity from the embedded Scratch editor. The bridge in
      // public/scratch-editor/index.html sends one of the four kinds the
      // monitor understands; lessonId is added here, and studentId comes from
      // the session inside /api/activity, never from the page.
      if (event.data && event.data.source === 'thinkkraft-editor') {
        if (!lessonId) return;
        try {
          await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId, kind: event.data.kind }),
          });
        } catch (error) {
          // Losing an activity event is not worth interrupting the child.
          console.error('Activity forward failed:', error);
        }
        return;
      }

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
        // Same origin, so name it rather than broadcasting with "*".
        iframeRef.current.contentWindow.postMessage(
          { type: 'REQUEST_SAVE' },
          window.location.origin,
        );
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
    <AppBar wide links={[{ href: "/dashboard", label: "My lessons" }]} />
    {/* The editor needs the width, so this page is not on the reading-width
        shell the rest of the app uses. */}
    <main className="shell-wide">
      {toast && (
        <div
          className={
            toast.type === 'success'
              ? 'panel-flat toast toast-success'
              : 'panel-flat toast'
          }
        >
          {toast.message}
        </div>
      )}

      <div className="workspace-head">
        <h1>Build your project</h1>
        <div className="workspace-meta">
          <span className="rolechip">Lesson {lessonId || "not chosen"}</span>
          {isAnalyzing && (
            <span className="muted thinking">Milo is looking at your blocks</span>
          )}
        </div>
      </div>

      <div className="panel panel-frame">
        <iframe
          ref={iframeRef}
          src="/scratch-editor/index.html"
          className="editor-frame"
          title="ThinkKraft Scratch Editor"
        />
      </div>

      {/* Between the editor and the save box, and on screen the whole time:
          a proactive nudge can arrive before anything has been saved. */}
      {studentId && lessonId && (
        // Keyed by lesson so moving to another one starts a fresh panel rather
        // than leaving the previous lesson's tips on screen.
        <HintPanel
          key={lessonId}
          studentId={studentId}
          lessonId={lessonId}
          captureProject={captureProject}
          onApproved={(text) =>
            showToast(`Your teacher approved a tip: ${text}`, "success")
          }
        />
      )}

      <div className="panel">
        <h2 className="panel-title">Save your project</h2>
        <p className="muted panel-note">
          Use <b>File {'>'} Save to your computer</b> in the editor above, then choose
          that file here. Milo already looks at your blocks when you press{" "}
          <b>Check my work</b>, so this is just for keeping a copy.
        </p>
        <div className="save-row">
          <input
            type="file"
            accept=".sb3"
            className="input-file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button className="btn-solid" onClick={save}>
            Save project
          </button>
        </div>
        {err && <p className="notice notice-error panel-msg">{err}</p>}
        {msg && <p className="notice notice-ok panel-msg">{msg}</p>}
      </div>
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