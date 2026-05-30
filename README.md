# Kevin English Dev

Dev = experimental development version.

This repository is the main development branch for ongoing upgrades of Kevin English.

## Positioning
- Main workspace for new features
- AI function experiments
- UI/UX iteration and product upgrades

## Development Scope
Includes:
- New training modules and flow upgrades
- AI-generated practice content
- Guided speaking / AI review
- UI experiments for iPhone learning experience
- Data model and architecture evolution

## Rule
- All new features and experiments go to this repo first.
- Only stable, necessary fixes can be backported to `kevin-audio-memory-stable`.

## Local Run

```bash
npm install
npm run dev
```

Default local URL:
- http://localhost:5182/

## Deploy (Vercel)
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Required env:
  - `OPENAI_API_KEY`

## Notes
- This is the future-facing development branch.
- Stable daily learning usage should remain in `kevin-audio-memory-stable`.
