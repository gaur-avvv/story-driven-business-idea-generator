
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createCohere } from '@ai-sdk/cohere';
import { createPerplexity } from '@ai-sdk/perplexity';
import { getProvider } from './aiProviderService';
import { resolveModelId } from './janService';
import { extractJson } from '../utils/jsonExtract';
import type { BusinessIdea, DiscussionMessage, Agent, ProviderSettings } from '../types';

const AGENTS: Agent[] = [
  {
    id: 'strategist',
    name: 'Sarah Strategist',
    role: 'Growth & Business Model',
    description: 'Expert in Blue Ocean Strategy, unit economics, and virality loops. She identifies the "unfair advantage" and moats.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&mouth=smile&eyebrows=default'
  },
  {
    id: 'skeptic',
    name: 'Marcus Skeptic',
    role: 'Risk & Competition',
    description: 'A professional pessimist. He looks for legal traps, low retention risks, and why competitors like Google/Amazon would crush this.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&mouth=pout&top=shortHair'
  },
  {
    id: 'architect',
    name: 'Elena Architect',
    role: 'Tech & Operations',
    description: 'Focuses on the MVP tech stack, scalability bottlenecks, and operational complexity. She knows what is practical to build in 3 months.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&top=longHair&accessories=glasses'
  },
  {
    id: 'visionary',
    name: 'Alex Visionary',
    role: 'Consumer Psychology',
    description: 'Focuses on the emotional hook, branding, and user pain points. Thinks about why a human would actually care about this product.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&mouth=smile&top=hat'
  }
];

async function generateWithRetry(model: Parameters<typeof generateText>[0]['model'], prompt: string, attempts = 2) {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await generateText({ model, prompt });
    } catch (e) {
      lastError = e;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastError;
}

export async function runAgentDiscussion(
  idea: BusinessIdea,
  modelIds: string[],
  settings: ProviderSettings
): Promise<{ messages: DiscussionMessage[], swot?: BusinessIdea['swot'] }> {  // Resolve local-Jan fallback once up front so agents never break on Render.
  const resolvedModelIds = await Promise.all(
    modelIds.map(async (id) => (await resolveModelId(id)).modelId)
  );

  const getModelForAgent = (index: number) => {
    const modelId = resolvedModelIds[index % resolvedModelIds.length];
    const provider = getProvider(modelId, settings);
    const modelName = modelId.includes(':') ? modelId.split(':')[1] : modelId;
    return provider(modelName);
  };

  const initialResponses: DiscussionMessage[] = [];

  // Round 1: Initial thoughts (Parallel)
  const round1Tasks = AGENTS.map(async (agent, index) => {
    const aiModel = getModelForAgent(index);
    const prompt = `
      You are ${agent.name}, the ${agent.role}.
      ${agent.description}

      BUSINESS IDEA:
      Headline: ${idea.idea}
      Market Insight: ${idea.marketInsight}
      Core Principle: ${idea.corePrinciple}
      Story: ${idea.story}

      TASK: Provide a high-impact, professional analysis from your specific perspective. 
      Analyze the feasibility, target market, or technical complexity. 
      Be opinionated but professional. (Max 100 words).
    `;

    try {
      const { text } = await generateWithRetry(aiModel, prompt);

      return {
        agentName: agent.name,
        avatar: agent.avatar,
        role: agent.role,
        content: text,
        timestamp: Date.now()
      };
    } catch (e) {
      console.error(`Error with agent ${agent.name} Round 1:`, e);
      return null;
    }
  });

  const round1Results = await Promise.all(round1Tasks);
  round1Results.forEach(res => { if (res) initialResponses.push(res); });

  // Round 2: Response/Rebuttal (Parallel with context)
  const round2Tasks = initialResponses.map(async (agentMsg, index) => {
    const aiModel = getModelForAgent(index);
    const agent = AGENTS.find(a => a.name === agentMsg.agentName)!;
    const othersResponses = initialResponses
      .filter(m => m.agentName !== agent.name)
      .map(m => `${m.agentName} (${m.role}): ${m.content}`)
      .join('\n\n');

    const prompt = `
      You are ${agent.name}, the ${agent.role}.
      
      You previously said: "${agentMsg.content}"

      Here is what your colleagues said:
      ${othersResponses}

      TASK: Respond directly to your colleagues' points. 
      Challenge their assumptions or provide a missing piece of the puzzle. 
      Keep it high-level and punchy (50-80 words).
    `;

    try {
      const { text } = await generateWithRetry(aiModel, prompt);

      return {
        agentName: agent.name,
        avatar: agent.avatar,
        role: agent.role,
        content: text,
        timestamp: Date.now() + 1000 // slightly later
      };
    } catch (e) {
      console.error(`Error with agent ${agent.name} Round 2:`, e);
      return null;
    }
  });

  const round2Results = await Promise.all(round2Tasks);
  
  // Interleave round 1 and round 2? Or just append. 
  // Appending is often clearer as a "discussion history".
  const finalDiscussion: DiscussionMessage[] = [...initialResponses];
  round2Results.forEach(res => { if (res) finalDiscussion.push(res); });

  // Round 3: Synthesis into SWOT
  let swot: BusinessIdea['swot'] | undefined = undefined;
  try {
      const aiModel = getModelForAgent(0); // Lead model for SWOT
      const swotPrompt = `
        Based on the preceding discussion between these agents, synthesize a concise SWOT matrix for the business idea "${idea.idea}".
        
        AGENTS' DEBATE HIGHLIGHTS:
        ${finalDiscussion.map(m => m.content).join('\n')}
        
        OUTPUT ONLY VALID JSON:
        {
            "strengths": ["...", "...", "..."],
            "weaknesses": ["...", "...", "..."],
            "opportunities": ["...", "...", "..."],
            "threats": ["...", "...", "..."]
        }
      `;

      const { text } = await generateWithRetry(aiModel, swotPrompt);

      const parsed = extractJson<BusinessIdea['swot']>(text);
      if (parsed && (parsed.strengths || parsed.weaknesses || parsed.opportunities || parsed.threats)) {
          swot = {
              strengths: parsed.strengths || [],
              weaknesses: parsed.weaknesses || [],
              opportunities: parsed.opportunities || [],
              threats: parsed.threats || [],
          };
      }
  } catch (e) {
      console.error("SWOT synthesis failed:", e);
  }

  return { messages: finalDiscussion, swot };
}
