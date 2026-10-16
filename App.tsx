
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { ResultCard } from './components/ResultCard';
import { Loader } from './components/Loader';
import { DiscussionBoard } from './components/DiscussionBoard';
import { generateBusinessIdea, generateImprovementStrategy, generateNarration, regenerateIdea, generatePitchDeck } from './services/geminiService';
import { fetchModels } from './services/modelService';
import { runAgentDiscussion } from './services/agentService';
import { webSearch } from './services/serpService';
import type { BusinessIdea, HistoryItem, ProviderSettings, AIModel, DiscussionMessage } from './types';
import { Welcome } from './components/Welcome';
import { t, Language } from './utils/i18n';
import { SettingsModal } from './components/SettingsModal';
import { HistorySidebar } from './components/HistorySidebar';
import { Toast, ToastType } from './components/Toast';
import { ApiKeyDialog } from './components/ApiKeyDialog';

type LoadingState = 'idle' | 'generating' | 'narrating' | 'refining' | 'discussing' | 'error';
export type Mode = 'new' | 'improve';

interface GenerationParams {
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
}

interface GeneratedResult {
    idea: BusinessIdea;
    mode: Mode;
}

const DEFAULT_SETTINGS: ProviderSettings = {
    google: { apiKey: '', enabled: true },
    openai: { apiKey: '', enabled: true },
    anthropic: { apiKey: '', enabled: true },
    mistral: { apiKey: '', enabled: true },
    groq: { apiKey: '', enabled: true },
    together: { apiKey: '', enabled: true },
    cohere: { apiKey: '', enabled: true },
    perplexity: { apiKey: '', enabled: true },
    deepseek: { apiKey: '', enabled: true },
    siliconflow: { apiKey: '', enabled: true },
    pollinations: { apiKey: '', enabled: true },
};

export default function App(): React.JSX.Element {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [lastGenerationParams, setLastGenerationParams] = useState<GenerationParams | null>(null);
  
  // Model Data
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // State for Provider Settings
  const [providerSettings, setProviderSettings] = useState<ProviderSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [missingKeyProvider, setMissingKeyProvider] = useState<{ id: string; modelName: string } | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('providerSettings');
    if (savedSettings) {
      try {
        setProviderSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    
    const savedHistory = localStorage.getItem('ideaHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Fetch models
    fetchModels().then(setAvailableModels);
  }, []);

  // Persist history to LocalStorage
  useEffect(() => {
      localStorage.setItem('ideaHistory', JSON.stringify(history));
  }, [history]);

  const handleSaveSettings = (settings: ProviderSettings) => {
    setProviderSettings(settings);
    localStorage.setItem('providerSettings', JSON.stringify(settings));
    setIsSettingsOpen(false);
    showToast('Settings saved!', 'success');
  };

  const getGeminiKey = useCallback(() => {
      return providerSettings.google?.apiKey || (process as any).env.GEMINI_API_KEY || '';
  }, [providerSettings]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const addToHistory = (idea: BusinessIdea, mode: Mode, params: GenerationParams) => {
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          mode,
          idea,
          params
      };
      setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50
  };

  const handleSelectItem = (item: HistoryItem) => {
      setGeneratedResult({ idea: item.idea, mode: item.mode });
      setLastGenerationParams(item.params);
      setAudioData(null); 
      setIsHistoryOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = (id: string) => {
      setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
      if (window.confirm("Are you sure you want to clear your entire idea history?")) {
          setHistory([]);
      }
  };

  const handleFeedback = (rating: 'up' | 'down') => {
    if (!history.length || !generatedResult) return;
    
    // Find the item in history that matches the current generated idea
    const itemToRate = history.find(item => item.idea.idea === generatedResult.idea.idea);
    if (!itemToRate) return;

    setHistory(prev => prev.map(item => item.id === itemToRate.id ? { ...item, feedback: rating } : item));
    showToast('Thanks for your feedback!', 'success');
  };

  const handleError = (err: unknown) => {
    console.error(err);
    const error = err as any;
    let message = t(language, 'unknownError');
    let type: ToastType = 'error';

    const errorMessage = error.message || String(error);

    if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('invalid_api_key')) {
      message = "Invalid or missing API key. Please check your settings.";
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      message = "Network error. Please check your internet connection.";
    } else if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
      message = "Rate limit reached. Please try again in a few minutes.";
    } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      message = "The content was blocked by safety filters. Try a different prompt.";
    } else if (errorMessage.includes('model') || errorMessage.includes('not found')) {
      message = "Selected model is currently unavailable. Try another engine.";
    } else if (errorMessage.includes('timeout')) {
      message = "The request timed out. Please try again.";
    }

    showToast(message, type);
    setLoadingState('idle');
  };

  const handleGenerate = useCallback(async (
      userInput: string, 
      mode: Mode, 
      enableThinking: boolean, 
      location: string,
      contentUrl: string,
      bookCategories: string[],
      trendKeywords: string,
      targetAudience: string,
      businessModel: string,
      selectedModelIds: string[]
    ) => {
    
    const params: GenerationParams = { userInput, mode, enableThinking, location, contentUrl, bookCategories, trendKeywords, targetAudience, businessModel, selectedModelIds };
    setLastGenerationParams(params);
    setLoadingState('generating');
    setGeneratedResult(null);
    setAudioData(null);

    try {
      // Real-time grounding: pull live market signals via SerpApi (server proxy).
      const searchQuery = [userInput, trendKeywords].filter(Boolean).join(' ').trim() || userInput;
      let liveSources: { title: string; uri: string }[] = [];
      let researchContext = '';
      if (searchQuery) {
        try {
          const results = await webSearch(searchQuery, { num: 6 });
          if (results.length > 0) {
            liveSources = results.map(r => ({ title: r.title, uri: r.uri }));
            researchContext = results
              .map((r, i) => `[${i + 1}] ${r.title}: ${r.snippet} (${r.uri})`)
              .join('\n');
          }
        } catch (e) {
          console.warn('Live research skipped:', e);
        }
      }

      const generationParams = { userInput, enableThinking, location, contentUrl, language, bookCategories, trendKeywords, targetAudience, businessModel, selectedModelIds, providerSettings, researchContext };

      const generatedIdea = mode === 'new'
        ? await generateBusinessIdea(generationParams)
        : await generateImprovementStrategy(generationParams);

      // Prefer freshly-cited live sources when available.
      if (liveSources.length > 0 && (!generatedIdea.sources || generatedIdea.sources.length === 0)) {
        generatedIdea.sources = liveSources;
      }
        
      setLoadingState('discussing');
      
      // Multi-Agent Discussion
      const { messages, swot } = await runAgentDiscussion(generatedIdea, selectedModelIds, providerSettings);
      generatedIdea.discussion = messages;
      generatedIdea.swot = swot;

      setGeneratedResult({ idea: generatedIdea, mode });
      addToHistory(generatedIdea, mode, params);

      setLoadingState('narrating');

      const narrationData = await generateNarration({ text: generatedIdea.story, language, apiKey: getGeminiKey() });
      setAudioData(narrationData);
      setLoadingState('idle');

    } catch (err: unknown) {
        handleError(err);
    }
  }, [language, getGeminiKey, providerSettings]);

  const handleGeneratePitchDeck = useCallback(async () => {
    if (!generatedResult || loadingState !== 'idle') return;
    
    setLoadingState('refining');
    try {
      const deck = await generatePitchDeck({
        idea: generatedResult.idea,
        language,
        providerSettings,
        selectedModelIds: lastGenerationParams?.selectedModelIds || ['google:gemma-4-31b-it']
      });
      
      const updatedIdea = { ...generatedResult.idea, pitchDeck: deck };
      setGeneratedResult({ ...generatedResult, idea: updatedIdea });
      
      setHistory(prev => prev.map(item => 
        item.idea.idea === generatedResult.idea.idea ? { ...item, idea: updatedIdea } : item
      ));
      
      showToast('Pitch Deck drafted!', 'success');
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingState('idle');
    }
  }, [generatedResult, language, getGeminiKey, loadingState]);

  const handleRegenerate = useCallback(async (refinementInput: string) => {
    const apiKey = getGeminiKey();
    if (!apiKey) {
        showToast(t(language, 'apiKeyError'), 'error');
        return;
    }

    if (!lastGenerationParams || !generatedResult) {
      showToast(t(language, 'unknownError'), 'error');
      return;
    }
    
    setLoadingState('refining');
    try {
        const regenerated = await regenerateIdea({
            ...lastGenerationParams,
            originalIdea: generatedResult.idea,
            refinement: refinementInput,
            language,
            providerSettings,
            selectedModelIds: lastGenerationParams.selectedModelIds
        });

        // Re-run discussion on regenerated idea
        setLoadingState('discussing');
        const { messages, swot } = await runAgentDiscussion(regenerated, lastGenerationParams.selectedModelIds || ['google:gemma-4-31b-it'], providerSettings);
        regenerated.discussion = messages;
        regenerated.swot = swot;

        setGeneratedResult({ idea: regenerated, mode: generatedResult.mode });
        
        const refinedParams = { ...lastGenerationParams, userInput: `${lastGenerationParams.userInput} [Refined: ${refinementInput}]` };
        addToHistory(regenerated, generatedResult.mode, refinedParams);

        setLoadingState('narrating');
        const narrationData = await generateNarration({ text: regenerated.story, language, apiKey });
        setAudioData(narrationData);
        setLoadingState('idle');
        showToast('Idea refined!', 'success');
    } catch (err) {
        handleError(err);
    }
  }, [getGeminiKey, lastGenerationParams, generatedResult, language, providerSettings]);

  const renderContent = () => {
    if (loadingState === 'generating') {
      return <Loader message={t(language, 'generating')} />;
    }
    
    if (loadingState === 'discussing') {
      return <Loader message="AI agents are debating..." />;
    }

    if (generatedResult) {
      return (
        <div className="space-y-8 result-enter" key={generatedResult.idea.idea}>
          <ResultCard
            idea={generatedResult.idea}
            mode={generatedResult.mode}
            audioData={audioData}
            language={language}
            onRegenerate={handleRegenerate}
            isRefining={loadingState === 'refining'}
            onFeedback={handleFeedback}
            currentFeedback={history.find(h => h.idea.idea === generatedResult.idea.idea)?.feedback}
            onShare={() => showToast(t(language, 'sharedToClipboard'), 'success')}
            onGeneratePitchDeck={handleGeneratePitchDeck}
            isGeneratingPitchDeck={loadingState === 'refining'}
          />
          {generatedResult.idea.discussion && (
            <DiscussionBoard messages={generatedResult.idea.discussion} />
          )}
        </div>
      );
    }
    
    return <Welcome language={language}/>;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        language={language}
        onLanguageChange={setLanguage}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onHistoryToggle={() => setIsHistoryOpen(true)}
        showHistoryBadge={history.length > 0}
      />
      
      <main id="main-content" className="flex-grow mx-auto w-full max-w-4xl px-4 md:px-8 pt-24 pb-16">
        <GeneratorForm
            onGenerate={handleGenerate} 
            disabled={loadingState === 'generating' || loadingState === 'narrating' || loadingState === 'refining' || loadingState === 'discussing'}
            language={language}
            availableModels={availableModels}
            providerSettings={providerSettings}
            onProviderKeyNeeded={(providerId, modelName) => {
                setMissingKeyProvider({ id: providerId, modelName });
            }}
        />
        <div className="mt-8 mb-16">
          {renderContent()}
        </div>
      </main>

      <HistorySidebar 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        language={language}
        onSelectItem={handleSelectItem}
        onDeleteItem={handleDeleteItem}
        onClearHistory={handleClearHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={providerSettings}
        language={language}
      />

      {missingKeyProvider && (
        <ApiKeyDialog
           isOpen={true}
           providerId={missingKeyProvider.id}
           modelNames={[missingKeyProvider.modelName]}
           onSave={(apiKey) => {
               const newSettings = {
                   ...providerSettings,
                   [missingKeyProvider.id]: { apiKey, enabled: true }
               };
               handleSaveSettings(newSettings);
               setMissingKeyProvider(null);
           }}
           onCancel={() => setMissingKeyProvider(null)}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}