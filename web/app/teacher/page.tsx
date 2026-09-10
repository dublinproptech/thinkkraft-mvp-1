import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

// Initialize the Prisma 7 Driver Adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });// Using the Next.js path alias to avoid dot-path confusion

export default async function TeacherConsole() {
  // Fetch real "PROPOSED" hints directly from the database
  const pendingHints = await prisma.hintEvent.findMany({
    where: {
      status: 'PROPOSED',
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
      <header style={{ marginBottom: '40px' }}>
        <div className="badge" style={{ marginBottom: '12px' }}>Phase 4 • Teacher UI</div>
        <h1 style={{ color: 'var(--navy)' }}>Teacher Dashboard</h1>
        <p className="muted" style={{ marginTop: '8px' }}>Review and approve pending hint requests from students.</p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {pendingHints.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p className="muted">No pending hint requests right now! 🎉</p>
          </div>
        ) : (
          pendingHints.map((hint) => (
            <div key={hint.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              
              <div>
                <h2 style={{ color: 'var(--violet)', marginBottom: '12px', fontSize: '1.5rem' }}>
                  {hint.student.displayName}
                </h2>
                
                <div className="status" style={{ marginBottom: '8px' }}>
                  <div className="dot wait"></div>
                  {/* Combines Course Title and Lesson Goal for context */}
                  <span>{hint.lesson.course.title} - {hint.lesson.goal}</span>
                </div>
                
                <p style={{ margin: 0, color: 'var(--ink)' }}>
                  <span className="muted">Requested Hint: </span> 
                  {hint.text}
                </p>
              </div>
              
              <button className="btn btn-primary">
                Approve
              </button>
              
            </div>
          ))
        )}
      </main>
    </div>
  );
}