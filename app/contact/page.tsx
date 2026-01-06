// app/contact/page.tsx
import React from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-md border border-[var(--border-color-accent)] px-6 py-8 bg-[var(--base-black)]"
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
          Contact
        </h1>
        <p className="mb-4 text-sm leading-[var(--line-height-normal)]">
          For collaborations, questions, or AiBou experiments, reach out
          directly via email. A full contact form and backend will land in
          Phase&nbsp;2.
        </p>
        <a
          href="mailto:hello@kyoudai.dev"
          className="inline-block px-4 py-2 text-xs border border-[var(--border-color-accent)] hover:text-[var(--design-vibrant1)]"
        >
          hello@kyoudai.dev
        </a>
        <div className="mt-6 text-xs text-[var(--design-vibrant2)]">
          Future: contact API route, spam controls, and social links.
        </div>
      </div>
    </main>
  );
}
