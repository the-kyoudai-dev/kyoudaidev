// app/about/page.tsx
import React from "react";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-3xl border border-[var(--border-color-accent)] px-6 py-8 bg-[var(--base-black)]"
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
          About Amukat
        </h1>
        <p className="mb-4 text-sm leading-[var(--line-height-normal)]">
          Amukat is a prompt architect and AiBou designer building KYOUDAI.dev
          as a living laboratory for agent design, control word systems, and
          joy-first tooling.
        </p>
        <p className="mb-4 text-sm leading-[var(--line-height-normal)]">
          The work centers on KYOUDAI principles: with joy as the telos,
          documentation as care, and collaboration as the default mode of
          thinking.
        </p>
        <p className="text-xs text-[var(--design-vibrant2)]">
          This page will later pull structured content from{" "}
          <code>Amukat_Profile.md</code>.
        </p>
      </div>
    </main>
  );
}
