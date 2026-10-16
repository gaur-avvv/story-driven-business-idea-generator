// Client helper for the server-side SerpApi proxy.
// The API key lives on the server (Render env var) and is never exposed here.

export interface SearchResult {
  title: string;
  uri: string;
  snippet: string;
}

interface SearchResponse {
  results: SearchResult[];
  answerBox?: any;
}

/**
 * Real-time web search via the server proxy.
 * Returns a compact list of citations, or [] if search isn't configured.
 */
export async function webSearch(query: string, opts: { num?: number; type?: 'search' | 'news' } = {}): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, num: opts.num ?? 8, type: opts.type ?? 'search' }),
    });
    if (!res.ok) {
      console.warn('Search unavailable:', res.status);
      return [];
    }
    const data: SearchResponse = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('webSearch failed:', e);
    return [];
  }
}

/** Formats search results into a short context block for LLM grounding. */
export function formatSearchContext(results: SearchResult[]): string {
  if (results.length === 0) return '';
  const lines = results.map((r, i) => `[${i + 1}] ${r.title} — ${r.snippet} (${r.uri})`).join('\n');
  return `LIVE WEB RESEARCH (SerpApi):\n${lines}`;
}
