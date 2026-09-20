import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./components/SignOutButton";

// Where each role's own area lives, so a signed-in visitor gets a way back in
// rather than being asked to log in again.
const HOME: Record<string, string> = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  PARENT: "/parent",
};

export default async function ThinkKraftHome() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const home = role ? HOME[role] : null;

  return (
    <main>
      <header
        className="appbar"
        style={{ borderBottom: "2px solid var(--line)", position: "relative" }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/logo.png"
            alt="ThinkKraft"
            width={120}
            height={40}
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>

        <nav
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 32,
            fontWeight: 800,
            fontSize: 17,
            color: "var(--navy)",
          }}
        >
          <Link href="#features" style={{ textDecoration: "none", color: "inherit" }}>
            Features
          </Link>
          <Link href="#ai" style={{ textDecoration: "none", color: "inherit" }}>
            AI Engine
          </Link>
          <Link href="#about" style={{ textDecoration: "none", color: "inherit" }}>
            About Us
          </Link>
        </nav>

        <div className="appbar-links">
          {home ? (
            <>
              <Link href={home} className="btn-solid btn-sm">
                Go to my dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn-solid btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <section
        className="shell"
        style={{ textAlign: "center", padding: "72px 24px 40px", maxWidth: 800 }}
      >
        <h1 style={{ fontSize: "3rem", color: "var(--navy)", marginBottom: 24, lineHeight: 1.1 }}>
          Powering the Next Generation of{" "}
          <span style={{ color: "var(--violet)" }}>Intelligent Work</span>
        </h1>
        <p className="muted" style={{ fontSize: "1.25rem", marginBottom: 40, lineHeight: 1.6 }}>
          ThinkKraft seamlessly bridges your web presence with advanced
          Python-driven AI. Build faster, analyze smarter, and scale without limits.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {home ? (
            <Link href={home} className="btn-solid" style={{ padding: "15px 30px", fontSize: 16 }}>
              Go to my dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-solid"
                style={{ padding: "15px 30px", fontSize: 16 }}
              >
                Login to Workspace
              </Link>
              <Link
                href="/register"
                className="btn-ghost"
                style={{ padding: "15px 30px", fontSize: 16 }}
              >
                Create an Account
              </Link>
            </>
          )}
        </div>
      </section>

      <section
        id="features"
        style={{ background: "var(--paper)", borderTop: "2px solid var(--line)", padding: "60px 0" }}
      >
        <div className="shell grid">
          <div className="panel">
            <div
              className="badge"
              style={{ marginBottom: 16, background: "var(--sky)", color: "var(--navy)" }}
            >
              1
            </div>
            <h3 style={{ marginBottom: 12, color: "var(--navy)" }}>Lightning Fast UI</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Built on Next.js, our frontend delivers sub-second page loads and
              seamless routing for a premium user experience.
            </p>
          </div>

          <div className="panel" id="ai">
            <div
              className="badge"
              style={{ marginBottom: 16, background: "var(--mint)", color: "var(--navy)" }}
            >
              2
            </div>
            <h3 style={{ marginBottom: 12, color: "var(--navy)" }}>Powerful Python AI</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Backed by FastAPI, our backend effortlessly handles complex machine
              learning models and high-throughput data processing.
            </p>
          </div>

          <div className="panel" id="about">
            <div
              className="badge"
              style={{ marginBottom: 16, background: "var(--gold)", color: "var(--navy)" }}
            >
              3
            </div>
            <h3 style={{ marginBottom: 12, color: "var(--navy)" }}>Reliable Data</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Powered by a robust PostgreSQL database, ensuring your users
              information is secure, scalable, and instantly accessible.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
