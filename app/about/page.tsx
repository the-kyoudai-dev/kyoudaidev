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

       <p className="mb-4 text-sm leading-normal">
        Amukat is a prompt architect and AiBou designer building KYOUDAI.dev as a
        living laboratory for agents, systems, and stories. The work sits at the
        intersection of research, design, and engineering, but always with joy as
        the organizing principle.
       </p>

       <p className="mb-4 text-sm leading-normal">
        Instead of treating AI as a black box, KYOUDAI treats each agent as an
        accountable collaborator. PrAPPt scripts, control words, and build prints
        turn fuzzy ideas into auditable, repeatable workflows that humans can
        inspect, remix, and improve.
       </p>

       <p className="mb-4 text-sm leading-normal">
        This space is where those AiBous are imagined, tested, and refined in
        public. If a tool increases clarity, reduces friction, or sparks delight,
        it stays. If it confuses or bores, it gets rewritten.
       </p>

       <p className="text-xs text-[var(--design-vibrant2)]">
        Future phases will pull structured biography and constraints directly from
        <code className="ml-1">Amukat_Profile.md</code> and related KCiv specs.
       </p>
      </div>
    </main>
  );
}
