# Kevin English Dev (V3.9.22)

Dev = experimental development version.

This repository is the main development line on top of V3.9.22.

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

For iPhone testing, keep the MacBook and iPhone on the same Wi-Fi and open the `Phone` URL printed by the dev server. Example:

```text
http://192.168.0.231:5182/
```

## Deploy (Vercel)
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist
- Env: OPENAI_API_KEY
