
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createCohere } from '@ai-sdk/cohere';
import { createPerplexity } from '@ai-sdk/perplexity';
import { ProviderSettings } from '../types';
import { getJanProvider } from './janService';

export function getProvider(modelId: string, settings: ProviderSettings) {
  const [providerPrefix] = modelId.split(':');
  const providerKey = settings[providerPrefix]?.apiKey;

  switch (providerPrefix) {
    // Local Gemma via Jan.ai (OpenAI-compatible local server)
    case 'jan':
      return getJanProvider(settings);
    case 'google':
      return createGoogleGenerativeAI({ apiKey: providerKey || process.env.GEMINI_API_KEY });
    case 'openai':
      return createOpenAI({ apiKey: providerKey });
    case 'anthropic':
      return createAnthropic({ apiKey: providerKey });
    case 'mistral':
      return createMistral({ apiKey: providerKey });
    case 'groq':
      return createGroq({ apiKey: providerKey });
    case 'together':
    case 'togetherai':
      return createTogetherAI({ apiKey: providerKey });
    case 'cohere':
      return createCohere({ apiKey: providerKey });
    case 'perplexity':
      return createPerplexity({ apiKey: providerKey });
    case 'siliconflow':
      return createOpenAI({
        apiKey: providerKey,
        baseURL: 'https://api.siliconflow.cn/v1'
      });
    case 'pollinations':
      return createOpenAI({
        apiKey: providerKey || 'unused',
        baseURL: 'https://text.pollinations.ai/openai'
      });
    case 'deepseek':
      return createOpenAI({
        apiKey: providerKey,
        baseURL: 'https://api.deepseek.com'
      });
    default:
      return createGoogleGenerativeAI({ apiKey: providerKey || process.env.GEMINI_API_KEY });
  }
}
