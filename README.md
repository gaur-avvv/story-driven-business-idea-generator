# Story-Driven Business Idea Generator

**Turn stories, books, and market trends into grounded business ideas — researched in real time, pressure-tested by an AI agent panel, and narrated in a studio voice.**

A React 19 + Vite + Express app that takes a spark (an industry, a theme, a book, a link, or just a location) and returns a fully-formed business concept: a market insight, a core principle, a narrative pitch, a SWOT matrix, a discussion between four specialist AI agents, a narratable story, and an export to Notion.

![license](https://img.shields.io/badge/license-MIT-blue)
![stack](https://img.shields.io/badge/React%2019-Vite%206-646cff)
![ui](https://img.shields.io/badge/design-Liquid%20Glass-6a4cff)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Supported AI providers & models](#supported-ai-providers--models)
- [Server API endpoints](#server-api-endpoints)
- [Scripts](#scripts)
- [Deployment (Render)](#deployment-render)
- [Design system](#design-system)
- [Data model](#data-model)
- [How a request flows](#how-a-request-flows)
- [Troubleshooting](#troubleshooting)
- [License & credits](#license--credits)

---

## Features

- **Story-driven generation** — every idea is delivered as market insight → core principle → narrative story, not just a bulleted list.
- **Real-time grounding** — [SerpApi](https://serpapi.com) powers live web/news search that grounds the prompt and surfaces as citations on the result card.
- **AI agent deliberation** — four specialist agents debate the idea across two rounds and synthesize a SWOT matrix:
  - **Sarah Strategist** — growth, business model, moats
  - **Marcus Skeptic** — risk, competition, why this fails
  - **Elena Architect** — tech stack, MVP feasibility, scalability
  - **Alex Visionary** — consumer psychology, branding, emotional hook
- **Studio narration** — the story is voiced via ElevenLabs (`/api/tts`), with a Gemini TTS fallback and browser `SpeechSynthesis` as a last resort.
- **Pitch deck generation** — one click turns the idea into a short investor-style deck.
- **Refine / iterate** — refine any generated idea with a free-text instruction and re-run the discussion.
- **Notion export** — push a full idea (insight, principle, story, roadmap, SWOT, sources) into a Notion page/database.
- **Multi-engine selection** — pick one or more models; the first is the "lead", the rest act as critics.
- **History sidebar** — every generation is saved locally with its inputs, feedback, and full result.
- **Theming** — Light / Dark / System, with a no-flash pre-paint script and a dynamic `theme-color`.
- **Internationalization** — English + Hindi UI.
- **Capability awareness** — the Engine Status strip reflects which integrations (SerpApi, ElevenLabs, Gemini, local Jan) are configured and reachable.

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS v4 (`@theme` tokens, no `tailwind.config`) |
| Build | Vite 6, `@vitejs/plugin-react`, `@tailwindcss/vite` |
| Server | Express 5 (Node), `tsx` for TypeScript runtime |
| AI | Vercel AI SDK (`ai` v6) + `@google/genai` for native TTS |
| Providers | Google, OpenAI, Anthropic, Mistral, Groq, TogetherAI, Cohere, Perplexity, DeepSeek, SiliconFlow, Pollinations, Jan (local Gemma) |
| Charts | Recharts (SWOT radar) |
| Motion | Framer Motion + native CSS |
| Research | SerpApi |
| Narration | ElevenLabs (+ Gemini TTS fallback) |

---

## Architecture

```
┌──────────────────────────── Browser (React SPA) ────────────────────────────┐
│  GeneratorForm → App state → geminiService / agentService (AI SDK)          │
│  ResultCard · DiscussionBoard · SwotRadarChart · AudioPlayer · History      │
└───────────────┬─────────────────────────────────────────────────────────────┘
                │  fetch /api/*                │  direct provider calls
                ▼                              ▼
┌──────────────────────────── Express server (server.ts) ─────────────────────┐
│  /api/health   /api/search (SerpApi)   /api/tts (ElevenLabs)                 │
│  /api/jan/status   /api/notion/save                                          │
│  • dev: Vite middleware    • prod: serves ./dist + SPA fallback              │
└──────────────────────────────────────────────────────────────────────────────┘
```

- In **development** the server runs Vite in middleware mode (HMR on one port).
- In **production** it serves the built `./dist` and falls back to `index.html` for client routes.
- Provider keys entered in the app's **Settings** modal live in the browser's `localStorage`; server-side keys (`.env.local` / Render env) stay on the server — **except** `GEMINI_API_KEY`, which is inlined into the client bundle at build time (see [Troubleshooting](#troubleshooting)).

---

## Project structure

```
story-driven-business-idea-generator/
├── App.tsx                    # Orchestration: state, history, dialogs, generation flow
├── index.tsx                  # React entry
├── index.css                  # Design tokens, dark mode, glass utilities, motion
├── index.html                 # Shell: fonts, favicon, no-FOUC theme script
├── server.ts                  # Express API + static/Vite serving
├── types.ts                   # Shared domain types
├── vite.config.ts             # Vite + Tailwind + env inlining
├── render.yaml                # Render blueprint
├── components/
│   ├── GeneratorForm.tsx      # Inputs, engine picker, presets, voice input
│   ├── ResultCard.tsx         # Idea output + actions
│   ├── DiscussionBoard.tsx    # Agent debate transcript
│   ├── SwotRadarChart.tsx     # Recharts SWOT radar
│   ├── AudioPlayer.tsx        # Narration playback (ElevenLabs/Gemini/browser)
│   ├── HistorySidebar.tsx     # Saved generations
│   ├── SettingsModal.tsx      # Provider API keys
│   ├── ApiKeyDialog.tsx       # Key prompt on model select
│   ├── NotionModal.tsx        # Notion export dialog
│   ├── Header.tsx · ThemeToggle.tsx · Welcome.tsx · Loader.tsx
│   ├── EngineStatus.tsx · Toast.tsx · Tooltip.tsx · Icon.tsx
├── hooks/
│   ├── useTheme.ts            # light | dark | system
│   ├── useDialog.ts           # native <dialog> plumbing
│   └── useAudioPlayer.ts      # audio element control
├── services/
│   ├── geminiService.ts       # Strategy generation + pitch deck + narration
│   ├── agentService.ts        # 4-agent debate + SWOT synthesis
│   ├── aiProviderService.ts   # Provider factory (AI SDK)
│   ├── modelService.ts        # Model catalogue (models.dev + curated)
│   ├── janService.ts          # Local Gemma (Jan.ai) + cloud fallback
│   ├── serpService.ts         # Front-end wrapper for /api/search
│   ├── ttsService.ts          # Front-end wrapper for /api/tts
│   └── statusService.ts       # /api/health + /api/jan/status
└── utils/
    ├── i18n.ts                # EN + HI translations
    ├── jsonExtract.ts         # Robust LLM JSON parsing
    ├── audio.ts · download.ts
```

---

## Getting started

**Prerequisites:** Node.js 20.12+ (uses `process.loadEnvFile`), npm.

```bash
# 1. Install
npm install

# 2. Configure secrets
cp .env.example .env.local      # then fill in your keys (see below)

# 3. Run (dev — Express + Vite middleware on one port)
npm run dev                     # → http://localhost:3000
```

The app works with an **empty** `.env.local` too — capabilities simply show as "off" and non-Gemini engines prompt for a key on selection.

Optional: run [Jan.ai](https://jan.ai) with a Gemma model loaded for fully local generation; the app auto-detects it and falls back to Gemini when it's unreachable.

---

## Environment variables

Copy `.env.example` → `.env.local` (server-side) or set them in the Render dashboard.

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Recommended | Google Gemini / Gemma fallback engine, Gemini TTS fallback. **Inlined into the client bundle at build time** — must be present during `npm run build`. |
| `SERPAPI_KEY` | Optional | Real-time web/news research + citations (`/api/search`). |
| `ELEVENLABS_KEY` | Optional | Studio narration (`/api/tts`). |
| `ELEVENLABS_MODEL` | Optional | ElevenLabs model id (default `eleven_multilingual_v2`). |
| `JAN_BASE_URL` | Optional | OpenAI-compatible local Gemma endpoint (default `http://localhost:1337/v1`). |
| `PORT` | Optional | Server port (Render injects this automatically). |

> Provider keys for the other engines (OpenAI, Anthropic, …) are **not** env vars — enter them in the app's Settings modal; they're stored in the browser's `localStorage`.

---

## Supported AI providers & models

The engine picker merges the live [models.dev](https://models.dev) catalogue with a curated list (including all Gemma models the Gemini API exposes).

| Provider id | Notes | Key source |
|---|---|---|
| `google` | Gemini + Gemma (`gemma-4-31b-it`, `gemma-4-26b-a4b-it`, …). Default engine. | `GEMINI_API_KEY` or Settings |
| `openai` | GPT models | Settings |
| `anthropic` | Claude models | Settings |
| `mistral` | Mistral models | Settings |
| `groq` | Fast inference | Settings |
| `together` / `togetherai` | Open models | Settings |
| `cohere` | Command models | Settings |
| `perplexity` | Sonar models | Settings |
| `deepseek` | DeepSeek models | Settings |
| `siliconflow` | DeepSeek V3 etc. | Settings |
| `pollinations` | Free text endpoint | none |
| `jan` | Local Gemma via Jan.ai | none (local) |

---

## Server API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Status of `serpapi`, `elevenlabs`, `gemini`, and `janBaseUrl`. |
| `POST` | `/api/search` | SerpApi proxy. Body: `{ query, num?, type? }`. Returns normalized `results[]`. |
| `POST` | `/api/tts` | ElevenLabs proxy. Body: `{ text, voiceId? }`. Returns `{ audioBase64, format }`. |
| `GET` | `/api/jan/status` | Whether local Jan/Gemma is reachable; lists local models. |
| `POST` | `/api/notion/save` | Creates a Notion page from a `BusinessIdea`. Body: `{ apiKey, parentId, isDatabase?, idea }`. |

---

## Scripts

| Script | Command | What it does |
|---|---|---|
| `dev` | `tsx server.ts` | Express + Vite middleware (HMR) on port 3000. |
| `build` | `vite build` | Builds the SPA into `./dist`. |
| `start` | `node --import tsx server.ts` | Production server (set `NODE_ENV=production` to serve `./dist`). |
| `preview` | `vite preview` | Preview the built SPA standalone. |
| `typecheck` | `tsc --noEmit` | Type-check the whole project. |

---

## Deployment (Render)

The repo ships a [`render.yaml`](render.yaml) blueprint.

### Blueprint (recommended)

1. Push this repo to GitHub.
2. Render → **New → Blueprint** → select the repo (it auto-detects `render.yaml`).
3. When prompted, set the secret env vars: `GEMINI_API_KEY`, `SERPAPI_KEY`, `ELEVENLABS_KEY`.
4. Apply. Render runs:
   - **Build:** `npm install --include=dev && npm run build`
   - **Start:** `npm start`
   - **Health check:** `/api/health`

### Manual web service

- **Environment:** Node
- **Build command:** `npm install --include=dev && npm run build`
- **Start command:** `npm start`
- **Env vars:** `NODE_ENV=production`, plus the keys above.

### Deployment notes

- `tsx` is a **runtime** dependency (used by `npm start`) and `vite` is imported **dynamically** only in dev, so production doesn't need devDependencies at runtime — but the build does, hence `--include=dev`.
- `GEMINI_API_KEY` must be set **before the build** because Vite inlines it into the client bundle.
- Health check path is `/api/health`; the free plan is enabled in the blueprint.

---

## Design system

An **HyperPlasma / Liquid Glass** identity:

- **Palette** — iridescent electric indigo (`oklch(52% 0.24 285)`) with aqua (`~205`) and magenta (`~340`) accents, on cool porcelain (light) / deep indigo-charcoal (dark) surfaces. Two-tier `oklch` tokens: primitives in `:root`, Tailwind `@theme --color-*` aliases on top. Dark mode overrides the same variables under `.dark`.
- **Type** — `Unbounded` (display), `Inter` (body), `Space Mono` (data/labels), all via Google Fonts.
- **Surfaces** — translucent glass panels with `backdrop-filter: blur() saturate()`, thin light borders, and layered elevation.
- **Motion** — a **Specular Light Sweep** (motion #43): a bright highlight crosses glass surfaces, buttons, chips, and badges on hover/focus. Respects `prefers-reduced-motion`.

Tokens live in [`index.css`](index.css). Components reference semantic utility classes only, so theme switching is automatic.

---

## Data model

```ts
interface BusinessIdea {
  idea: string;              // headline
  marketInsight: string;     // why now
  corePrinciple: string;     // the underlying principle
  story: string;             // narrative pitch
  marketScarcity?: string;
  nextSteps?: string[];      // execution roadmap
  swot?: { strengths: string[]; weaknesses: string[];
           opportunities: string[]; threats: string[] };
  sources?: { title: string; uri: string }[];   // from SerpApi
  discussion?: DiscussionMessage[];             // agent debate
  pitchDeck?: string;
}
```

---

## How a request flows

1. **Input** — the user provides an industry/theme (or link/location) and picks engines, audience, and business model.
2. **Grounding** — `serpService` queries `/api/search` (SerpApi); results are folded into the prompt as research context.
3. **Generation** — `geminiService.generateStrategy` calls the selected provider via the AI SDK; the response is parsed with a robust JSON extractor (handles fenced blocks, prose, and trailing commas).
4. **Deliberation** — `agentService.runAgentDiscussion` runs the four agents (round 1 parallel, round 2 rebuttals, round 3 SWOT synthesis) with per-call retries.
5. **Presentation** — `ResultCard` renders the idea, roadmap, SWOT radar, sources, and actions (pitch deck, refine, narrate, export).
6. **Persistence** — the run is stored in the History sidebar with its parameters and feedback.

---

## Troubleshooting

- **Generation returns "Strategic Analysis"** — the model didn't return parseable JSON. `utils/jsonExtract.ts` already handles fenced/prose/trailing-comma cases; switching to a stronger model usually resolves it.
- **`GEMINI_API_KEY` is exposed in the client bundle** — by design: `vite.config.ts` `define`s it so the browser can call Gemini directly. It is **not** a server-only secret. Rotate it if it's a real production key, or refactor generation behind a server route.
- **Production crashes on boot** — ensure you're on Express 5-safe routing (this repo's `/api` and SPA fallback already are; bare `app.get('*')` is invalid).
- **Narration button does nothing** — set `ELEVENLABS_KEY`, or the app falls back to Gemini TTS, then to the browser voice.
- **No citations** — set `SERPAPI_KEY`; without it, generation continues without live sources.
- **Local Gemma errors** — start Jan.ai with an OpenAI-compatible server; otherwise the app falls back to Gemini automatically.

---

## License & credits

MIT.

- Design style, font pairing, and motion spec selected with the [**HyperPlasma**](https://github.com/gaur-avvv/HyperPlasma-Skills) skill (Liquid Glass · Unbounded + Inter · Specular Light Sweep).
- Model catalogue from [models.dev](https://models.dev).
- Built with the [Vercel AI SDK](https://sdk.vercel.ai/).
