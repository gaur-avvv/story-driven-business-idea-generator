import { generateText } from 'ai';
import { getProvider } from './aiProviderService';
import { resolveModelId } from './janService';
import { GoogleGenAI, Modality } from "@google/genai";
import type { BusinessIdea, ProviderSettings } from '../types';
import type { Language } from "../utils/i18n";
import { extractJson } from '../utils/jsonExtract';

const NARRATION_MODEL = 'gemini-2.5-flash-preview-tts';

interface BaseParams {
    language: Language;
    providerSettings: ProviderSettings;
    selectedModelIds: string[];
}

interface GenerationParams extends BaseParams {
    userInput: string;
    enableThinking: boolean;
    location?: string;
    contentUrl?: string;
    bookCategories?: string[];
    trendKeywords?: string;
    targetAudience?: string;
    businessModel?: string;
    researchContext?: string;
}

interface RegenerationParams extends GenerationParams {
    originalIdea: BusinessIdea;
    refinement: string;
}

interface NarrationParams {
    text: string;
    language: Language;
    apiKey: string;
}

async function generateStrategy(params: GenerationParams, promptFn: (p: GenerationParams) => string): Promise<BusinessIdea> {
    const { enableThinking, selectedModelIds, providerSettings } = params;
    
    // Use the first model as the Lead Architect, with smart fallback if
    // local Gemma (Jan) is selected but not reachable.
    const { modelId } = await resolveModelId(selectedModelIds[0] || 'google:gemini-2.5-flash');
    const provider = getProvider(modelId, providerSettings);
    const modelName = modelId.includes(':') ? modelId.split(':')[1] : modelId;
    const aiModel = provider(modelName);

    const prompt = promptFn(params);
    
    try {
        const { text } = await generateText({
            model: aiModel,
            prompt: prompt,
            // Add reasoning for models that support it
        });
        
        let parsedData = extractJson(text);

        if (!parsedData) {
            parsedData = {
                idea: "Strategic Analysis",
                marketInsight: "Generated based on model insights. Formatting was manually restored.",
                corePrinciple: "Generic Business Principle",
                story: text,
            };
        }

        // Handle grounding sources if available (specifically for SDK calls)
        // In AI SDK, sources might be in tool outputs or grounded content
        const sources: any[] = [];
        // Note: AI SDK's generateText doesn't have a direct equivalent to Gemini's groundingMetadata easily exposed yet without custom tool parsing
        
        return { ...parsedData, sources };
    } catch (error) {
        console.error("Error generating strategy:", error);
        throw error;
    }
}


export function generateBusinessIdea(params: GenerationParams): Promise<BusinessIdea> {
    // ... rest of prompt logic remains same but params signature changed
    const promptFn = (p: GenerationParams) => {
    const { userInput, language, location: locationQuery, contentUrl, enableThinking, bookCategories, trendKeywords, targetAudience, businessModel, researchContext } = p;
    const languageInstruction = language === 'hi'
        ? "IMPORTANT: Your entire response, including all fields in the JSON output, MUST be in Hinglish (Hindi written in the Roman script)."
        : "";

    const researchBlock = researchContext
        ? `\n**LIVE MARKET RESEARCH (real-time, cite these as [1], [2], ... in marketInsight):**\n${researchContext}\n`
        : "";
    
    const researchInstruction = enableThinking 
        ? `
        **DEEP ANALYSIS MODE ENABLED:**
        You must perform a rigorous investigation. Use Google Search to query Google Scholar, ResearchGate, arXiv, and industry-specific research databases. 
        Look for academic papers, market whitepapers, and peer-reviewed studies related to "${userInput || 'emerging business trends'}". 
        ${trendKeywords ? `Prioritize these specific market trend keywords: ${trendKeywords}.` : ''}
        Incorporate empirical findings or theoretical frameworks (e.g., behavioral economics, disruptive innovation theory) into the 'marketInsight' and 'corePrinciple'.
        ` 
        : `Analyze current market trends using Google Search. ${trendKeywords ? `Focus on these keywords: ${trendKeywords}.` : ''}`;

    const categoriesInstruction = bookCategories && bookCategories.length > 0
        ? `Focus on business principles specifically from the following categories: ${bookCategories.join(', ')}.`
        : "Choose a principle from a business classic (e.g., '$100M Offers', 'The Lean Startup', 'Blue Ocean Strategy').";

    return `
    As an expert business strategist and AI product architect, design a new business idea.
    ${languageInstruction}
    ${researchBlock}

    ${contentUrl ? `
    **Inspiration Context:**
    The user has provided this link for inspiration: ${contentUrl}.
    Analyze its core message. Use Google Search to understand its context if necessary.
    ` : ''}

    Process:
    1.  **Analyze Context:** ${researchInstruction}
    2.  **Target Audience:** The core persona for this product/service is "${targetAudience || 'General'}". Tailor the idea, marketing angle, and feature set specifically to appeal to them.
    3.  **Business Model:** Architect the revenue streams and operations around a "${businessModel && businessModel !== 'Any' ? businessModel : 'Hybrid/Innovative'}" model.
    4.  **Select Core Principle:** ${categoriesInstruction} Ensure the principle is supported by your research.
    5.  **Synthesize Idea:** Combine research insights and the principle into a new concept. Domain: "${userInput || 'General innovation'}".
    ${locationQuery ? `6.  **Localize**: Use Google Maps data for "${locationQuery}" to tailor this to the local geography.` : ''}
    7.  **Write the Story**: Write a compelling business parable. Include real-world service names (e.g., 'Vercel', 'AWS', 'Shopify') for actionability.
    8.  **Format Output**: Return ONLY a single JSON object.
    
    JSON Schema:
    {
      "idea": "1-2 sentence headline.",
      "marketInsight": "The evidence-based 'Why now?' incorporating research findings.",
      "corePrinciple": "The foundational strategy, business model strategy, and its source.",
      "marketScarcity": "Analysis of why this idea is logically rare and what the specific barriers to entry are.",
      "nextSteps": ["Step 1...", "Step 2...", "Step 3..."],
      "story": "The full business parable focusing on the target audience and business model."
    }
    `;
    }
    return generateStrategy(params, promptFn);
}


export function generateImprovementStrategy(params: GenerationParams): Promise<BusinessIdea> {
     const promptFn = (p: GenerationParams) => {
     const { userInput, language, location: locationQuery, contentUrl, enableThinking, bookCategories, trendKeywords, targetAudience, businessModel } = p;
     const languageInstruction = language === 'hi' 
        ? "IMPORTANT: Your entire response, including all fields in the JSON output, MUST be in Hinglish (Hindi written in the Roman script)." 
        : "";

    const researchInstruction = enableThinking 
        ? `
        **DEEP ANALYSIS MODE ENABLED:**
        For this business problem, use Google Search to find academic case studies and research on Google Scholar regarding operational efficiency, consumer psychology, or industry-specific optimizations. 
        ${trendKeywords ? `Prioritize analyzing these keywords in context of the problem: ${trendKeywords}.` : ''}
        Synthesize these findings to offer a high-level strategic improvement.
        ` 
        : `Analyze the problem using general web insights. ${trendKeywords ? `Focus on: ${trendKeywords}.` : ''}`;

    const categoriesInstruction = bookCategories && bookCategories.length > 0
        ? `Prioritize strategic frameworks from the categories: ${bookCategories.join(', ')}.`
        : "Choose a relevant framework (e.g., Theory of Constraints, 80/20 Rule).";

     return `
     As an expert business consultant, analyze this problem and generate an improvement strategy.
     ${languageInstruction}

    User Problem: "${userInput}"
    Target Audience: "${targetAudience || 'General'}" - Prioritize solutions that appeal directly to this demographic.
    Business Model Focus: "${businessModel && businessModel !== 'Any' ? businessModel : 'Hybrid/Innovative'}" - Structure the improvements around this specific operational model.

    ${contentUrl ? `**Inspiration Link:** ${contentUrl}. Use Google Search to find its core principles.` : ''}

    Process:
    1.  **Analyze Problem:** ${researchInstruction}
    ${locationQuery ? `2.  **Local Market Analysis**: Use Google Maps for "${locationQuery}" to find local competitor data or customer patterns.` : ''}
    3.  **Select Core Principle:** ${categoriesInstruction}
    4.  **Synthesize Strategy:** Create a specific action plan tailored for the target audience and business model.
    5.  **Write Implementation Story:** A brief case study showing successful execution.
    6.  **Format Output:** Return ONLY a JSON object.
    
    JSON Schema:
    {
      "idea": "Headline for the improvement strategy.",
      "marketInsight": "Analysis of the core problem with research-backed insights.",
      "corePrinciple": "Foundational principle, tailored business model adjustments, and source.",
      "marketScarcity": "Analysis of why this specific solution is rare or hard to implement for competitors.",
      "nextSteps": ["Action 1...", "Action 2...", "Action 3..."],
      "story": "The full implementation story."
    }
    `;
    }
    return generateStrategy(params, promptFn);
}

const getAIClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key is not configured.");
    }
    return new GoogleGenAI({ apiKey });
};

export async function generatePitchDeck(params: {
    idea: BusinessIdea;
    language: string;
    providerSettings: ProviderSettings;
    selectedModelIds: string[];
  }): Promise<string> {
    const { modelId } = await resolveModelId(params.selectedModelIds[0] || 'google:gemini-2.5-flash');
    const provider = getProvider(modelId, params.providerSettings);
    const modelName = modelId.includes(':') ? modelId.split(':')[1] : modelId;
    const aiModel = provider(modelName);

    const prompt = `
      Create a professional 10-slide pitch deck outline for the following business idea.
      Language: ${params.language === 'hi' ? 'Hindi' : 'English'}.
  
      Idea: ${params.idea.idea}
      Market Insight: ${params.idea.marketInsight}
      Core Principle: ${params.idea.corePrinciple}
  
      For each slide, provide a Title and 3-4 bullet points.
      Slides:
      1. Introduction/Hook
      2. Problem
      3. Solution
      4. Market Opportunity
      5. Product / How it works
      6. Business Model (Revenue)
      7. Competitive Advantage
      8. Go-to-market Strategy
      9. The Team (Generic placeholders but roles defined)
      10. The Ask / Vision
  
      Format as clear Markdown.
    `;
  
    const { text } = await generateText({
        model: aiModel,
        prompt: prompt,
    });
    return text;
  }
  
export function regenerateIdea(params: RegenerationParams): Promise<BusinessIdea> {
    const promptFn = (p: GenerationParams) => {
        const { language } = p;
        const languageInstruction = language === 'hi'
            ? "IMPORTANT: Your entire response, including all fields in the JSON output, MUST be in Hinglish (Hindi written in the Roman script)."
            : "";
        
        const originalContext = JSON.stringify(params.originalIdea, (key, value) => key === 'sources' ? undefined : value, 2);

        const researchInstruction = params.enableThinking 
            ? "Deeply research the user's specific refinement using Google Scholar and research sites to ensure the pivot is grounded in data." 
            : "Integrate the refinement using current web trends.";

        return `
        You are a creative co-author. The user wants to refine their concept.
        ${languageInstruction}

        **Original Context:**
        ${originalContext}

        **Refinement:**
        "${params.refinement}"

        **Task:**
        1. ${researchInstruction}
        2. Seamlessly blend the new input into the original business model.
        3. Write a natural continuation of the story.
        4. Return ONLY a JSON object.
        `;
    };
    return generateStrategy({ ...params, userInput: params.refinement }, promptFn);
}


export async function generateNarration(params: NarrationParams): Promise<string> {
    const { text, language, apiKey } = params;

    // Prefer ElevenLabs (server-side key) for natural narration.
    try {
        const { narrateWithElevenLabs } = await import('./ttsService');
        const el = await narrateWithElevenLabs(text);
        if (el) {
            // Return a playable data URI; AudioPlayer/download detect the format.
            return `data:audio/${el.format};base64,${el.base64}`;
        }
    } catch (e) {
        console.warn('ElevenLabs narration unavailable, falling back to Gemini TTS:', e);
    }

    // Fallback: Gemini TTS (raw PCM base64).
    const ai = getAIClient(apiKey);
    const narrationInstruction = language === 'hi'
        ? "Narrate this Hinglish story in a clear, engaging, and professional tone:"
        : "Narrate this story in a clear, engaging, and professional tone:";

    try {
        const response = await ai.models.generateContent({
            model: NARRATION_MODEL,
            contents: [{ parts: [{ text: `${narrationInstruction} ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Narration error:", error);
        throw new Error("Narration failed. Please check your API key.");
    }
}