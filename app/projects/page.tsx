// app/projects/page.tsx
import React from "react";

const projects = [
  {
    name: "KYOUDAI.dev",
    role: "Public interface for KYOUDAI Civilization",
    tone: "content-warm2",
  },
  {
    name: "KCivAiTHENA",
    role: "Research Architect AiBou for discovery & control words",
    tone: "research-cool2",
  },
  {
    name: "KCivMPG",
    role: "Master PrAPPt Generator for AiBou scripts",
    tone: "content-warm2",
  },
  {
    name: "Control Word Discovery Engine",
    role: "Methodology for extracting hardened domain verbs",
    tone: "research-cool1",
  },
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-4xl border border-[var(--border-color-accent)] px-6 py-8 bg-[var(--base-black)]"
        style={{
          boxShadow: "var(--shadow-card-hover)",
          borderRadius: "var(--border-radius-none)",
        }}
      >
        <h1
          className="mb-4"
          style={{
            fontSize: "var(--font-size-l)",
            lineHeight: "var(--line-height-tight)",
            letterSpacing: "var(--letter-spacing-wide)",
          }}
        >
          Projects
        </h1>
        <p className="mb-6 text-sm leading-[var(--line-height-normal)]">
          A small constellation of AiBous, frameworks, and methods that make up
          the KYOUDAI ecosystem. This list will later expand into detailed
          project pages.
        </p>
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          {projects.map((p) => (
            <div
              key={p.name}
              className="border border-[var(--border-color-default)] p-4"
            >
              <h2 className="mb-1 font-bold">{p.name}</h2>
              <p className="text-[var(--content-warm2)]">{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
