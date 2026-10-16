// Local Gemma via Jan.ai — an OpenAI-compatible local server.
// Jan typically runs at http://localhost:1337/v1 and serves Gemma locally.
// The Express server exposes /api/jan/status to detect reachability so the UI
// can fall back to a cloud provider (Gemini) when Jan isn't running — e.g. on
// Render, where there is no local Jan.

import { createOpenAI } from '@ai-sdk/openai';
import type { ProviderSettings } from '../types';

export const JAN_DEFAULT_BASE_URL = 'http://localhost:1337/v1';
export const JAN_PROVIDER_ID = 'jan';

/** Curated local Gemma model served through Jan (id matches Jan's model list). */
export const JAN_GEMMA_MODEL = {
  id: 'jan:gemma-3-4b-it',
  name: 'Gemma 3 4B (Local · Jan)',
  provider: JAN_PROVIDER_ID,
  providerName: 'Jan (Local Gemma)',
  contextWindow: 8192,
  tags: ['local', 'private', 'gemma'],
};

let cachedJanStatus: { available: boolean; base: string; checkedAt: number } | null = null;
const STATUS_TTL_MS = 15_000;

/** Ask the server whether local Jan/Gemma is reachable. Cached briefly. */
export async function checkJanStatus(force = false): Promise<{ available: boolean; base: string }> {
  const now = Date.now();
  if (!force && cachedJanStatus && now - cachedJanStatus.checkedAt < STATUS_TTL_MS) {
    return { available: cachedJanStatus.available, base: cachedJanStatus.base };
  }
  try {
    const res = await fetch('/api/jan/status');
    const data = await res.json();
    cachedJanStatus = { available: Boolean(data.available), base: data.base || JAN_DEFAULT_BASE_URL, checkedAt: now };
    return { available: cachedJanStatus.available, base: cachedJanStatus.base };
  } catch {
    cachedJanStatus = { available: false, base: JAN_DEFAULT_BASE_URL, checkedAt: now };
    return { available: false, base: JAN_DEFAULT_BASE_URL };
  }
}

/** True if the given model id targets the local Jan/Gemma provider. */
export function isJanModel(modelId: string): boolean {
  return modelId.split(':')[0] === JAN_PROVIDER_ID;
}

/**
 * Smart fallback: if the lead model is local Gemma (Jan) but Jan isn't
 * reachable, transparently fall back to a cloud model (Gemini) so the app —
 * including the Render demo — never breaks. Returns the model id to actually use.
 */
export async function resolveModelId(modelId: string): Promise<{ modelId: string; usedFallback: boolean }> {
  if (!isJanModel(modelId)) return { modelId, usedFallback: false };
  const status = await checkJanStatus();
  if (status.available) return { modelId, usedFallback: false };
  return { modelId: 'google:gemini-2.5-flash', usedFallback: true };
}

/**
 * Build an OpenAI-compatible client pointed at the local Jan server.
 * Jan requires no API key by default, but a placeholder keeps the SDK happy.
 */
export function getJanProvider(settings: ProviderSettings) {
  const base = settings[JAN_PROVIDER_ID]?.apiKey
    ? settings[JAN_PROVIDER_ID].apiKey.replace(/\/$/, '')
    : JAN_DEFAULT_BASE_URL;
  return createOpenAI({ apiKey: 'jan-local', baseURL: base });
}
