import Link from "next/link";
import Image from "next/image";

export default function ThinkKraftHome() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white text-slate-900">
      {/* Navigation Bar */}
      <header className="w-full flex justify-between items-center py-3 px-6 border-b border-gray-100 max-w-7xl mx-auto relative">
        {/* Logo Section */}
        <Link href="/">
          <Image 
            src="/logo.png" 
            alt="ThinkKraft Logo" 
            width={200} 
            height={200} 
            className="w-20 h-auto scale-150 origin-left"
          />
        </Link>

        {/* Navigation Links - Perfectly Centered */}
        <nav className="hidden md:block space-x-8 text-lg font-bold text-slate-800 absolute left-1/2 transform -translate-x-1/2">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link href="#ai" className="hover:text-blue-600 transition-colors">AI Engine</Link>
          <Link href="#about" className="hover:text-blue-600 transition-colors">About Us</Link>
        </nav>

        {/* Get Started Button */}
        <button className="bg-slate-900 text-white px-6 py-2 border border-slate-900 rounded-md text-base font-bold hover:bg-slate-800 transition-all">
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-4 w-full max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Powering the Next Generation of <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Intelligent Work</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl">
          ThinkKraft seamlessly bridges your web presence with advanced Python-driven AI. Build faster, analyze smarter, and scale without limits.
        </p>
        <div className="flex space-x-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Start Building
          </button>
          <button className="bg-white text-slate-900 px-8 py-3 rounded-md font-semibold border border-slate-200 hover:border-slate-400 transition-all">
            View Documentation
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="w-full bg-slate-100 pt-8 pb-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6 text-xl font-bold">1</div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast UI</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Built on Next.js, our frontend delivers sub-second page loads and seamless routing for a premium user experience.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6 text-xl font-bold">2</div>
            <h3 className="text-xl font-bold mb-3">Powerful Python AI</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Backed by FastAPI, our backend effortlessly handles complex machine learning models and high-throughput data processing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6 text-xl font-bold">3</div>
            <h3 className="text-xl font-bold mb-3">Reliable Data</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Powered by a robust PostgreSQL database, ensuring your users information is secure, scalable, and instantly accessible.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}