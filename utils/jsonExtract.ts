/**
 * Robust JSON extraction from LLM output.
 * Handles fenced ```json blocks, plain objects, and stray prose around the JSON.
 */
export function extractJson<T = any>(text: string): T | null {
  if (!text) return null;

  // 1) Prefer an explicit fenced block (```json ... ``` or ``` ... ```)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    const parsed = tryParse<T>(fenced[1]);
    if (parsed !== null) return parsed;
  }

  // 2) Fall back to the outermost {...} or [...] span
  const objSpan = sliceSpan(text, '{', '}');
  if (objSpan) {
    const parsed = tryParse<T>(objSpan);
    if (parsed !== null) return parsed;
  }
  const arrSpan = sliceSpan(text, '[', ']');
  if (arrSpan) {
    const parsed = tryParse<T>(arrSpan);
    if (parsed !== null) return parsed;
  }

  return null;
}

function sliceSpan(text: string, open: string, close: string): string | null {
  const start = text.indexOf(open);
  const end = text.lastIndexOf(close);
  if (start === -1 || end <= start) return null;
  return text.substring(start, end + 1);
}

function tryParse<T>(candidate: string): T | null {
  const trimmed = candidate.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Common LLM issues: trailing commas before a closing brace/bracket.
    try {
      const cleaned = trimmed.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}
