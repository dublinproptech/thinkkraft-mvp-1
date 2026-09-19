import Link from 'next/link';
import React from 'react';

export default function StudentDashboard() {
  // Mock lesson data for the UI
  const lessons = [
    { id: "lesson-1", title: "1. Intro to Scratch", status: "ok", desc: "Learn the basics of blocks and sprites." },
    { id: "lesson-2", title: "2. Loops & Movement", status: "wait", desc: "Make your character move continuously." },
    { id: "lesson-3", title: "3. Adding Sound", status: "bad", desc: "Complete previous lessons to unlock." }
  ];

  return (
    <main className="wrap">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: '8px' }}>Student Dashboard</h1>
        <p className="muted" style={{ fontSize: '18px', margin: 0 }}>
          Pick a lesson to enter your workspace.
        </p>
      </header>

      <section className="grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="status">
              <div className={`dot ${lesson.status}`}></div>
              <span style={{ color: 'var(--navy)', fontSize: '18px' }}>{lesson.title}</span>
            </div>
            
            <p className="muted" style={{ margin: 0, lineHeight: 1.5, flexGrow: 1 }}>
              {lesson.desc}
            </p>

            {lesson.status !== 'bad' ? (
              <Link href={`/workspace?lessonId=${lesson.id}`} style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                  Start Lesson
                </button>
              </Link>
            ) : (
              <button 
                className="btn" 
                disabled 
                style={{ 
                  width: '100%', 
                  marginTop: 'auto', 
                  background: 'var(--line)', 
                  color: 'var(--muted)', 
                  cursor: 'not-allowed' 
                }}
              >
                Locked
              </button>
            )}
            
          </div>
        ))}
      </section>
    </main>
  );
}