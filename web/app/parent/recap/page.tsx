import React from 'react';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize Prisma with the driver adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export default async function WeeklyRecapPage() {
  // Fetch real data from PostgreSQL via Prisma
  const studentData = await prisma.student.findFirst({
    include: {
      _count: {
        select: {
          projects: true,
          hintEvents: {
            where: {
              status: { in: ['APPROVED', 'DELIVERED'] }
            }
          }
        }
      },
      skills: {
        where: {
          level: { in: ['LEARNING', 'PRACTISING'] }
        },
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    }
  });

  // Handle the case where the database is empty
  if (!studentData) {
    return (
      <main className="wrap">
        <p className="muted" style={{ fontSize: '18px', marginTop: '32px' }}>
          No student progress data found for this week.
        </p>
      </main>
    );
  }

  // Set the mastery focus string
  const currentFocus = studentData.skills[0]?.skill || "Foundational Concepts";

  return (
    <main className="wrap">
      {/* Header Section */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: '8px' }}>Weekly Progress Recap</h1>
        <p className="muted" style={{ fontSize: '18px' }}>Great work from {studentData.displayName} this week!</p>
      </header>

      {/* Metrics Grid */}
      <section className="grid" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--violet)', lineHeight: 1 }}>
            {studentData._count.projects}
          </span>
          <span className="muted" style={{ marginTop: '12px' }}>Lessons Completed</span>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>
            {studentData._count.hintEvents}
          </span>
          <span className="muted" style={{ marginTop: '12px' }}>AI Hints Utilized</span>
        </div>
      </section>

      {/* Details Card */}
      <section className="card">
        <div className="badge" style={{ marginBottom: '16px' }}>Current Focus</div>
        <h2 style={{ color: 'var(--navy)', marginBottom: '12px' }}>{currentFocus}</h2>
        <p style={{ lineHeight: 1.6 }}>
          {studentData.displayName} is showing strong progress in <strong>{currentFocus}</strong>. 
          The AI tutor stepped in a couple of times to help clarify concepts, which was safely approved by the teacher.
        </p>
      </section>
    </main>
  );
}