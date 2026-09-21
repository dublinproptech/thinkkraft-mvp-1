'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppBar from '../../components/AppBar';

// What the parent agreed to when they added a child. The Consent row itself is
// written when the child account is created, so this page explains the terms
// and confirms them rather than being the thing that grants access.
export default function ParentConsentPage() {
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <>
      <AppBar links={[{ href: '/parent', label: 'Your family' }]} />

      <main className="shell-narrow">
        <div className="page-head">
          <h1>How ThinkKraft works</h1>
          <p>What your child sees, and who checks it first.</p>
        </div>

        <div className="panel">
          <p style={{ marginTop: 0, lineHeight: 1.6 }}>
            ThinkKraft teaches your child to code in Scratch. An AI tutor watches
            their project and suggests hints, but it never speaks to your child
            directly. <strong>A human teacher reads and approves every hint before
            your child sees it.</strong>
          </p>
          <p style={{ lineHeight: 1.6 }}>
            Your child signs in with a username and PIN that you choose, so they
            never need an email address of their own. You can see their progress
            any time from your family page.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}
          >
            <label
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  width: 22,
                  height: 22,
                  accentColor: 'var(--violet)',
                  cursor: 'pointer',
                  flex: 'none',
                  marginTop: 2,
                }}
              />
              I consent to my child using ThinkKraft and agree to the platform
              guidelines.
            </label>

            {saved && (
              <p className="notice notice-ok" style={{ margin: 0 }}>
                Thanks, that is recorded.
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="btn-solid" disabled={!agreed}>
                Confirm
              </button>
              <Link href="/parent" className="btn-ghost">
                Back to your family
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
