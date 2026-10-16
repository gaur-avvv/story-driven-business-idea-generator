// Reads the server's /api/health endpoint to surface which integrations are
// configured (SerpApi, ElevenLabs, Gemini) and whether local Jan/Gemma is live.

export interface AppStatus {
  ok: boolean;
  serpapi: boolean;
  elevenlabs: boolean;
  gemini: boolean;
  janBaseUrl: string;
}

let cached: { data: AppStatus; at: number } | null = null;
const TTL = 20_000;

export async function getAppStatus(force = false): Promise<AppStatus> {
  const now = Date.now();
  if (!force && cached && now - cached.at < TTL) return cached.data;
  const fallback: AppStatus = { ok: false, serpapi: false, elevenlabs: false, gemini: false, janBaseUrl: 'http://localhost:1337/v1' };
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const status: AppStatus = {
      ok: true,
      serpapi: Boolean(data.serpapi),
      elevenlabs: Boolean(data.elevenlabs),
      gemini: Boolean(data.gemini),
      janBaseUrl: data.janBaseUrl || fallback.janBaseUrl,
    };
    cached = { data: status, at: now };
    return status;
  } catch {
    return cached?.data || fallback;
  }
}
