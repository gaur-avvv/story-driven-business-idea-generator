
import type { Mode } from './App';

export interface BusinessIdea {
  idea: string;
  marketInsight: string;
  corePrinciple: string;
  story: string;
  sources?: {
    title: string;
    uri: string;
  }[];
  discussion?: DiscussionMessage[];
  pitchDeck?: string;
  marketScarcity?: string;
  nextSteps?: string[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export interface DiscussionMessage {
  agentName: string;
  avatar: string;
  role: string;
  content: string;
  timestamp: number;
}

export interface AIModel {
  id: string; // The model ID used by AI SDK
  name: string;
  provider: string;
  providerName: string;
  contextWindow: number;
  tags?: string[];
  pricing?: {
    prompt: number;
    completion: number;
  };
}

export interface ProviderSettings {
  [providerId: string]: {
    apiKey: string;
    enabled: boolean;
  };
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: Mode;
  idea: BusinessIdea;
  feedback?: 'up' | 'down' | null;
  params: {
    userInput: string;
    mode: Mode;
    enableThinking: boolean;
    location: string;
    contentUrl: string;
    bookCategories: string[];
    trendKeywords: string;
    targetAudience: string;
    businessModel: string;
    selectedModelIds: string[];
  };
}
