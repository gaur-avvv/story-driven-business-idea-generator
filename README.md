<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Story-Driven Business Idea Generator

Turn stories and books into grounded business ideas — researched in real time, drafted by local or cloud AI, and voiced in the studio.

**Stack:** React 19 + Vite + Tailwind v4 + Express. AI via the Vercel AI SDK (Gemini + 8 providers) and local Gemma through Jan.ai.

## Integrations

| Capability | Provider | How it runs |
|---|---|---|
| Local Gemma | Jan.ai (`http://localhost:1337/v1`) | Selected as an engine; auto-falls-back to Gemini when unreachable (Render demo) |
| Real-time research | SerpApi (`/api/search`) | Server-side proxy; results ground the prompt and land as citations |
| Studio narration | ElevenLabs (`/api/tts`) | MP3 via server proxy, Gemini TTS fallback, browser speech last resort |
| Engine status | `/api/health`, `/api/jan/status` | Capabilities strip in the generator form |
| Hosting | Render (`render.yaml`, `/api/health`) | `npm run build` → `npm start` serves SPA + API |

## Run locally

1. Install: `npm install`
2. Copy `.env.example` → `.env.local` and fill in:
   - `GEMINI_API_KEY` (fallback cloud model)
   - `SERPAPI_KEY` (live research)
   - `ELEVENLABS_KEY` (narration)
   - Leaves these blank and the app still works (capabilities show off).
3. Optional: start [Jan.ai](https://jan.ai) with a Gemma model loaded for fully local generation.
4. Run: `npm run dev` → http://localhost:3000

## Deploy to Render

1. Push this repo to GitHub.
2. In Render: **New → Web Service → from repo**. It auto-detects `render.yaml`.
3. Set `GEMINI_API_KEY`, `SERPAPI_KEY`, `ELEVENLABS_KEY` in the Render dashboard (Environment). 
4. Deploy. `/api/health` is the health check.

## Design

Warm studio / bold poster identity: Fraunces display + Hanken Grotesk body + IBM Plex Mono data, two-tier oklch tokens, native `<dialog>` modals, code-split charts.
