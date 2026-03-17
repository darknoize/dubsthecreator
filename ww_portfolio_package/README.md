# Will Weems Portfolio — Handoff Package

This folder is a clean HTML/CSS/JS starter mirroring the Illustrator layouts.
All visuals are separated into assets (SVG). Text stays as real HTML text.

## Run
Open index.html directly, or run:
python -m http.server 8080

## Files
- index.html
- piceus.html
- css/styles.css
- app.js
- projects.json
- assets/bg-gradient-wave.svg
- assets/dot-overlay.svg
- assets/featured-visual.svg
- assets/favicon.svg

## Copilot prompt (paste exactly)
You are implementing a Next.js App Router portfolio site using the provided static package.
Requirements:
1) Replicate layout + styling from css/styles.css.
2) Use /public/assets/bg-gradient-wave.svg and /public/assets/dot-overlay.svg as layered backgrounds.
3) Use projects.json as the content model (expand it).
4) Render filter chips that filter cards by tag (match static behavior).
5) Clicking a card routes to /work/[slug] and renders a use-case page.
6) Keep text as HTML text. Keep visuals as separate SVG assets (do not bake text into images).
7) Preserve the minimal, modern, non-boxy feel and spacing.
