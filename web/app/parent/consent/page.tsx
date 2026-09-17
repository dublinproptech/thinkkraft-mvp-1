'use client';

import React, { useState } from 'react';

export default function ParentConsentPage() {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Consent granted");
  };

  return (
    <main className="wrap">
      <div className="card">
        <h1 style={{ color: 'var(--navy)', marginBottom: '16px' }}>
          Parental Consent & Setup
        </h1>
        <p className="muted" style={{ fontSize: '16px', marginBottom: '32px', lineHeight: 1.6 }}>
          ThinkKraft uses an AI tutor to help your child learn Scratch safely. 
          A human teacher approves every hint before your child sees it.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', fontWeight: 700 }}>
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '24px', height: '24px', accentColor: 'var(--violet)', cursor: 'pointer' }}
            />
            I consent to my child using ThinkKraft and agree to the platform guidelines.
          </label>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!agreed}
            style={{ 
              alignSelf: 'flex-start', 
              opacity: agreed ? 1 : 0.6,
              cursor: agreed ? 'pointer' : 'not-allowed' 
            }}
          >
            Grant Access
          </button>
        </form>
      </div>
    </main>
  );
}