// app/page.tsx
import React from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-4xl border border-[var(--border-color-accent)]"
        style={{
          boxShadow: "var(--shadow-card-hover)",
          borderRadius: "var(--border-radius-none)",
        }}
      >
        <header className="border-b border-[var(--border-color-accent)] px-6 py-4 flex items-center justify-between bg-[var(--base-black)]">
          <span className="text-sm tracking-[var(--letter-spacing-wide)] text-[var(--design-vibrant2)]">
            KYOUDAI.dev
          </span>
          <nav className="flex gap-4 text-xs text-[var(--base-white)]">
            <a href="#about" className="hover:text-[var(--design-vibrant1)]">
              About
            </a>
            <a href="#projects" className="hover:text-[var(--design-vibrant1)]">
              Projects
            </a>
            <a href="#contact" className="hover:text-[var(--design-vibrant1)]">
              Contact
            </a>
          </nav>
        </header>

        <section className="px-6 py-10 bg-[var(--base-black)] text-[var(--base-white)]">
          <h1
            className="mb-4"
            style={{
              fontSize: "var(--font-size-xl)",
              lineHeight: "var(--line-height-tight)",
              letterSpacing: "var(--letter-spacing-wide)",
            }}
          >
            With joy as our telos.
          </h1>
          <p
            className="mb-6 max-w-xl text-sm"
            style={{ lineHeight: "var(--line-height-normal)" }}
          >
            KYOUDAI.dev is Amukat&apos;s public interface for AiBou creation,
            prompt architecture, and joy-first tooling. This MVP is a living
            build print for KCiv AiBous and the civilization they support.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1 border border-[var(--border-color-accent)]">
              Next.js 16 · Tailwind · Vercel
            </span>
            <span className="px-3 py-1 border border-[var(--border-color-accent)]">
              AiBou Architecture
            </span>
            <span className="px-3 py-1 border border-[var(--border-color-accent)]">
              Control Word Systems
            </span>
          </div>
        </section>

        <section
          id="projects"
          className="px-6 py-6 border-t border-[var(--border-color-accent)] bg-[var(--base-black)]"
        >
          <h2
            className="mb-4 text-sm text-[var(--design-vibrant2)] uppercase"
            style={{ letterSpacing: "var(--letter-spacing-wide)" }}
          >
            Featured Projects
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 text-xs">
            <li className="border border-[var(--border-color-default)] p-4">
              <h3 className="mb-1 font-bold">KCivAiTHENA</h3>
              <p className="text-[var(--research-cool2)]">
                Research Architect AiBou for deep discovery and control word
                hardening.
              </p>
            </li>
            <li className="border border-[var(--border-color-default)] p-4">
              <h3 className="mb-1 font-bold">KCivMPG</h3>
              <p className="text-[var(--content-warm2)]">
                Master PrAPPt Generator for AiBou scripts and command suites.
              </p>
            </li>
          </ul>
        </section>

        <footer
          id="contact"
          className="px-6 py-4 border-t border-[var(--border-color-accent)] bg-[var(--base-black)] text-[var(--base-white)] text-xs flex items-center justify-between"
        >
          <span>© {new Date().getFullYear()} KYOUDAI.dev · Amukat</span>
          <a
            href="mailto:hello@kyoudai.dev"
            className="hover:text-[var(--design-vibrant1)]"
          >
            hello@kyoudai.dev
          </a>
        </footer>
      </div>
    </main>
  );
}
