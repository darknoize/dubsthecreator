# Will Weems Portfolio — Handoff Package

This folder is a clean HTML/CSS/JS starter mirroring the Illustrator layouts.
All visuals are separated into assets (SVG). Text stays as real HTML text.

## Run
Open index.html directly, or run:
python -m http.server 8080

## Deployment
This folder is the live app root for https://www.dubsthecreator.com on Vercel.

From this directory:

```bash
vercel --yes
```

Creates a preview deployment.

```bash
vercel --prod --yes
```

Deploys to production and updates https://www.dubsthecreator.com.

## Files
- index.html (main portfolio overview)
- projects/piceus.html (PICEUS project details)
- projects/[category].html (category project pages)
- projects/assets/css/styles.css
- projects/assets/js/app.js
- projects.json
- images/ (background images and project visuals)
- assets/ (additional assets)

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
