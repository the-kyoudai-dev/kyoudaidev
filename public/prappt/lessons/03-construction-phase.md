---
title: "Construction Phase: Build the PrAPPt Script (Backwards)"
difficulty: "foundational"
prerequisites: ["02-discovery-phase"]
estimatedTime: "18 min"
tags: ["prappt","product","regulation","approach","persona","purpose","trigger","reverse-engineering"]
updated: "2026-01-08"
---

## The key idea: write forward, read backward

PrAPPt is designed to be *written* from Product to Trigger, but *read* by the AI from Trigger to Product.

This is why the framework teaches "reverse engineering" as an architecture, not a vibe.

## The build order (the PrAPPt spine)

Use this order when authoring:

1. [[PRODUCT]] — The destination deliverable (formats, specifics, constraints).
2. [[REGULATION]] — The conscience (safety, navigation, refusal rules, confirmations).
3. [[APPROACH]] — The step-by-step workflow from hello → product.
4. [[PURPOSE]] + [[PERSONA]] — The "why" and "who," often using "The user understands that you are…" syntax.
5. [[TRIGGER]] — The activator phrase (e.g., `prappt-CookieAI`).

## PRODUCT: specify like an engineer

Good PRODUCT definitions include structure, required fields, and output format—not just "help me."

Example: CookieAI didn't output "a recipe"; it specified name, difficulty, quantity, equipment, ingredients, instructions, and nutrition facts.

## REGULATION: "consideration," not censorship

REGULATION is where you take responsibility for safe and navigable interaction, including commands like `[back]`, `[restart]`, `[help]`.

It also includes confirmation behaviors (e.g., "Always confirm before finalizing").

## APPROACH: make the path explicit

Approach should be enumerated steps because models follow stepwise flows reliably.

Example structure:
- Step 1: Greet & summarize intent.
- Step 2: Ask clarifying questions.
- Step 3: Generate draft options.
- Step 4: Confirm and deliver PRODUCT.

## Connections

- Next: [[04-activation-iteration|Activation & Iteration]] teaches how to test, catch drift, and patch the script.