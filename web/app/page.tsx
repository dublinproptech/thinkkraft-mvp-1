import Link from "next/link";
import Image from "next/image";

export default function ThinkKraftHome() {
  return (
    <main>
      {/* Navigation Bar */}
      <header className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--line)", paddingBottom: "16px", paddingTop: "16px", position: "relative" }}>
        {/* Logo Section */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Image 
            src="/logo.png" 
            alt="ThinkKraft Logo" 
            width={120} 
            height={40} 
            style={{ objectFit: "contain" }} 
          />
        </Link>

        {/* Navigation Links - Perfectly Centered */}
        <nav style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "32px", fontWeight: 800, fontSize: "18px", color: "var(--navy)" }}>
          <Link href="#features" style={{ textDecoration: "none", color: "inherit" }}>Features</Link>
          <Link href="#ai" style={{ textDecoration: "none", color: "inherit" }}>AI Engine</Link>
          <Link href="#about" style={{ textDecoration: "none", color: "inherit" }}>About Us</Link>
        </nav>

        {/* Get Started Button */}
        <button className="btn btn-primary">
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="wrap" style={{ textAlign: "center", padding: "80px 24px 40px", maxWidth: "800px" }}>
        <h1 style={{ fontSize: "3rem", color: "var(--navy)", marginBottom: "24px", lineHeight: 1.1 }}>
          Powering the Next Generation of <span style={{ color: "var(--violet)" }}>Intelligent Work</span>
        </h1>
        <p className="muted" style={{ fontSize: "1.25rem", marginBottom: "40px", lineHeight: 1.6 }}>
          ThinkKraft seamlessly bridges your web presence with advanced Python-driven AI. Build faster, analyze smarter, and scale without limits.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button className="btn btn-primary" style={{ padding: "16px 32px", fontSize: "16px" }}>
            Start Building
          </button>
          <button className="btn btn-secondary" style={{ padding: "16px 32px", fontSize: "16px" }}>
            View Documentation
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ backgroundColor: "var(--paper)", borderTop: "2px solid var(--line)", padding: "60px 0" }}>
        <div className="wrap grid">

          <div className="card">
            <div className="badge" style={{ marginBottom: "16px", backgroundColor: "var(--sky)", color: "var(--navy)" }}>1</div>
            <h3 style={{ marginBottom: "12px", color: "var(--navy)" }}>Lightning Fast UI</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Built on Next.js, our frontend delivers sub-second page loads and seamless routing for a premium user experience.
            </p>
          </div>

          <div className="card">
            <div className="badge" style={{ marginBottom: "16px", backgroundColor: "var(--mint)", color: "var(--navy)" }}>2</div>
            <h3 style={{ marginBottom: "12px", color: "var(--navy)" }}>Powerful Python AI</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Backed by FastAPI, our backend effortlessly handles complex machine learning models and high-throughput data processing.
            </p>
          </div>

          <div className="card">
            <div className="badge" style={{ marginBottom: "16px", backgroundColor: "var(--gold)", color: "var(--navy)" }}>3</div>
            <h3 style={{ marginBottom: "12px", color: "var(--navy)" }}>Reliable Data</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.5 }}>
              Powered by a robust PostgreSQL database, ensuring your users information is secure, scalable, and instantly accessible.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}