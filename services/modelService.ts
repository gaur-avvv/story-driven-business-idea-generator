
import type { AIModel } from '../types';
import { JAN_GEMMA_MODEL } from './janService';

const MODELS_API_URL = 'https://models.dev/api.json';

// All Gemma models exposed through the Google Gemini API.
// Verified against generativelanguage.googleapis.com/v1beta/models (only these two exist).
const GOOGLE_GEMMA_MODELS: AIModel[] = [
  {
    id: 'google:gemma-4-31b-it',
    name: 'Gemma 4 31B Instruct',
    provider: 'google',
    providerName: 'Google',
    contextWindow: 262144,
    tags: ['open-weights', 'High IQ']
  },
  {
    id: 'google:gemma-4-26b-a4b-it',
    name: 'Gemma 4 26B A4B Instruct',
    provider: 'google',
    providerName: 'Google',
    contextWindow: 262144,
    tags: ['open-weights', 'Turbo Speed']
  },
];

// Static definitions for extra providers not in models.dev
const EXTRA_MODELS: AIModel[] = [
  ...GOOGLE_GEMMA_MODELS,
  {
    id: 'siliconflow:deepseek-v3',
    name: 'DeepSeek V3 (Silicon Flow)',
    provider: 'siliconflow',
    providerName: 'Silicon Flow',
    contextWindow: 64000,
    tags: ['fast', 'cheap', 'large-context']
  },
  {
    id: 'pollinations:openai',
    name: 'Pollinations AI (Text)',
    provider: 'pollinations',
    providerName: 'Pollinations AI',
    contextWindow: 4096,
    tags: ['free', 'experimental']
  },
  // Local Gemma served through Jan.ai (OpenAI-compatible local server)
  JAN_GEMMA_MODEL,
];

export async function fetchModels(): Promise<AIModel[]> {
  try {
    const response = await fetch(MODELS_API_URL);
    if (!response.ok) throw new Error('Failed to fetch models from models.dev');
    const data = await response.json();
    
    const fetchedModels: AIModel[] = [];
    
    // models.dev structure is an object where keys are provider IDs
    // Each provider has a 'models' object where keys are model IDs
    Object.entries(data).forEach(([providerId, providerData]: [string, any]) => {
      if (providerData.models && typeof providerData.models === 'object') {
        Object.entries(providerData.models).forEach(([modelId, modelDetails]: [string, any]) => {
          const mId = `${providerId}:${modelId}`;
          const tags = [...(modelDetails.tags || [])];
          
          // Heuristic for intelligence/speed
          if (mId.includes('3.5-sonnet') || mId.includes('gpt-4') || mId.includes('pro') || mId.includes('ultra') || mId.includes('deepseek-v3')) {
            tags.push('High IQ');
          } else if (mId.includes('flash') || mId.includes('turbo') || mId.includes('mini') || mId.includes('haiku')) {
            tags.push('Turbo Speed');
          }
          
          const pricing = modelDetails.cost ? {
            prompt: modelDetails.cost.prompt || 0,
            completion: modelDetails.cost.completion || 0
          } : undefined;

          fetchedModels.push({
            id: mId,
            name: modelDetails.name || modelId,
            provider: providerId,
            providerName: providerData.name || providerId,
            contextWindow: modelDetails.context,
            tags: tags,
            pricing: pricing
          });
        });
      }
    });
    
    const extraIds = new Set(EXTRA_MODELS.map(m => m.id));
    const dedupedFetched = fetchedModels.filter(m => !extraIds.has(m.id));
    return [...dedupedFetched, ...EXTRA_MODELS];
  } catch (error) {
    console.error('Error fetching models:', error);
    return EXTRA_MODELS; // Fallback to extra models if fetch fails
  }
}

export function getProviderLogo(providerId: string): string {
    const fallbacks: Record<string, string> = {
        'pollinations': 'https://pollinations.ai/favicon.ico',
        'siliconflow': 'https://siliconflow.cn/favicon.ico', // or any better logo
        // Local Jan/Gemma: inline mark so it renders even offline
        'jan': "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231f6f5c'/%3E%3Ctext x='16' y='22' font-family='monospace' font-size='15' font-weight='700' fill='white' text-anchor='middle'%3EJ%3C/text%3E%3C/svg%3E",
    };

    if (fallbacks[providerId]) return fallbacks[providerId];
    return `https://models.dev/logos/${providerId}.svg`;
}
