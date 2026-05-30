# Kevin English Dev (V3.9.5)

Dev = experimental development version.

This repository is the main development line on top of V3.9.5.

## Scope
- New features and flow upgrades
- AI features and generation
- UI/UX experiments
- Data model evolution

## Rule
- All new work goes to this repo first.
- Stable repo only receives minimal necessary fixes.

## Local
```bash
npm install
npm run dev
```
Default: http://localhost:5182/

## Deploy (Vercel)
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist
- Env: OPENAI_API_KEY
