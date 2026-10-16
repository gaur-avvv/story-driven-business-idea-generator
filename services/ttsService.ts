// Client helper for the server-side ElevenLabs TTS proxy.
// The API key lives on the server (Render env var) and is never exposed here.

interface TtsResponse {
  audioBase64: string;
  format: string;
}

/**
 * Narrate text with ElevenLabs via the server proxy.
 * Returns a base64 audio payload plus format, or null if narration
 * isn't configured / failed (caller should fall back to browser speech).
 */
export async function narrateWithElevenLabs(
  text: string,
  opts: { voiceId?: string } = {}
): Promise<{ base64: string; format: string } | null> {
  if (!text.trim()) return null;
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: opts.voiceId }),
    });
    if (!res.ok) {
      console.warn('Narration unavailable:', res.status);
      return null;
    }
    const data: TtsResponse = await res.json();
    return { base64: data.audioBase64, format: data.format };
  } catch (e) {
    console.error('narrateWithElevenLabs failed:', e);
    return null;
  }
}
