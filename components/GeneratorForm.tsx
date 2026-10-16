import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import type { Mode } from '../App';
import { t, Language } from '../utils/i18n';
import { Tooltip } from './Tooltip';
import { EngineStatus } from './EngineStatus';
import type { AIModel, ProviderSettings } from '../types';
import { getProviderLogo } from '../services/modelService';

interface GeneratorFormProps {
  onGenerate: (userInput: string, mode: Mode, enableThinking: boolean, location: string, contentUrl: string, bookCategories: string[], trendKeywords: string, targetAudience: string, businessModel: string, selectedModelIds: string[]) => void;
  disabled: boolean;
  language: Language;
  availableModels: AIModel[];
  providerSettings: ProviderSettings;
  onProviderKeyNeeded: (providerId: string, modelName: string) => void;
}

const CATEGORIES = [
  { id: 'Marketing', labelKey: 'catMarketing' },
  { id: 'Strategy', labelKey: 'catStrategy' },
  { id: 'Finance', labelKey: 'catFinance' },
  { id: 'Operations', labelKey: 'catOps' },
  { id: 'Sales', labelKey: 'catSales' },
  { id: 'Leadership', labelKey: 'catLeadership' },
  { id: 'Psychology', labelKey: 'catPsychology' },
  { id: 'Sustainability', labelKey: 'catSustainability' },
  { id: 'AI & Tech', labelKey: 'catTech' },
  { id: 'Retail', labelKey: 'catRetail' },
  { id: 'B2B SaaS', labelKey: 'catB2BSaaS' },
  { id: 'D2C', labelKey: 'catD2C' },
  { id: 'FinTech', labelKey: 'catFinTech' },
  { id: 'EdTech', labelKey: 'catEdTech' },
] as const;

const TRENDS = [
  'Hyper-personalization',
  'Circular Economy',
  'Remote-first',
  'Zero-trust Security',
  'Creator Economy',
  'Web3/Decentralization',
  'AI-Generated Content',
  'Subscription Models',
  'Low-code/No-code',
  'BioTech',
  'Clean Energy',
];

const INSPIRATION_PRESETS = [
  'Uber for X',
  'SaaS for Small Business',
  'Eco-friendly marketplace',
  'AI tutor for coding',
];

async function geocode(query: string): Promise<{ lat: number, lon: number, name: string } | null> {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
            headers: { 'User-Agent': 'BusinessIdeaGenerator/1.0' }
        });
        const data = await res.json();
        if (data && data[0]) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
        }
        return null;
    } catch (e) {
        console.error("Geocoding failed:", e);
        return null;
    }
}

const PROMPT_EXAMPLES = [
  'AI-powered legal assistant',
  'Sustainable fashion marketplace',
  'Personalized fitness for elderly',
  'Remote team building platform',
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, disabled, language, availableModels, providerSettings, onProviderKeyNeeded }) => {
  const [userInput, setUserInput] = useState('');
  const [mode, setMode] = useState<Mode>('new');
  const [enableThinking, setEnableThinking] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contentUrl, setContentUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [trendKeywords, setTrendKeywords] = useState('');
  const [targetAudience, setTargetAudience] = useState('General');
  const [businessModel, setBusinessModel] = useState('Any');

  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(['google:gemma-4-31b-it']);
  const [modelSearch, setModelSearch] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredModels = availableModels.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.providerName.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const toggleModel = (id: string) => {
    setSelectedModelIds(prev => {
        if (prev.includes(id)) {
            if (prev.length === 1) return prev;
            return prev.filter(m => m !== id);
        }

        const model = availableModels.find(m => m.id === id);
        if (model) {
            const isGoogle = model.provider === 'google';
            const isFree = model.provider === 'pollinations' || model.provider === 'jan';
            const hasKey = providerSettings[model.provider]?.apiKey?.trim();
            if (!hasKey && !isFree && !isGoogle) {
                onProviderKeyNeeded(model.provider, model.name);
            }
        }

        return [...prev, id];
    });
  };

  const selectedModels = availableModels.filter(m => selectedModelIds.includes(m.id));

  const modeConfig = {
    new: {
        label: t(language, 'formLabelNew'),
        placeholder: t(language, 'formPlaceholderNew'),
        buttonText: t(language, 'formButtonNew')
    },
    improve: {
        label: t(language, 'formLabelImprove'),
        placeholder: t(language, 'formPlaceholderImprove'),
        buttonText: t(language, 'formButtonImprove')
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                setLocationQuery(coords);
                setLocationStatus('success');
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationStatus('error');
            }
        );
    }
  };

  const handleGeocode = async () => {
    if (!locationQuery || locationQuery.includes(',')) return;
    setLocationStatus('loading');
    const result = await geocode(locationQuery);
    if (result) {
        setLocationQuery(`${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}`);
        setLocationStatus('success');
    } else {
        setLocationStatus('error');
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(userInput, mode, enableThinking, locationQuery, contentUrl, selectedCategories, trendKeywords, targetAudience, businessModel, selectedModelIds);
  };

  const labelClass = "block text-xs font-bold uppercase tracking-wider text-text-muted";

  return (
    <div className="card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-7 border-b border-border-subtle pb-3">
            {(['new', 'improve'] as Mode[]).map((m) => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-5 py-2.5 text-sm font-bold transition-all rounded-lg ${
                        mode === m
                            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                            : 'text-text-muted hover:text-text-secondary hover:bg-background-tertiary'
                    }`}
                >
                    {m === 'new' ? t(language, 'formTabNew') : t(language, 'formTabImprove')}
                </button>
            ))}
            <span className="ml-auto hidden sm:block badge">
                <Icon name="sparkles" className="w-3 h-3" /> AI Studio
            </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Engine selection */}
            <div className="relative" ref={dropdownRef}>
                <div className="flex items-center gap-2 mb-3">
                    <label className={labelClass}>Engine Selection</label>
                    <Tooltip text={t(language, 'tipModelSelection')} position="top">
                        <Icon name="info" className="w-3.5 h-3.5 text-text-muted cursor-help" />
                    </Tooltip>
                </div>
                <div
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="input-field flex items-center justify-between cursor-pointer group pr-4"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex -space-x-2">
                           {selectedModels.slice(0, 3).map(m => (
                               <img key={m.id} src={getProviderLogo(m.provider)} className="w-6 h-6 object-contain rounded-full bg-background-secondary border-2 border-card" alt="" />
                           ))}
                           {selectedModels.length > 3 && (
                               <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-[8px] flex items-center justify-center border-2 border-card font-bold shadow-sm">
                                   +{selectedModels.length - 3}
                               </div>
                           )}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                                {selectedModels.length === 1 ? selectedModels[0].name : `${selectedModels.length} Models Selected`}
                            </span>
                            <span className="text-[10px] text-text-muted">Lead: {selectedModels[0]?.name}</span>
                        </div>
                    </div>
                    <Icon name={isModelDropdownOpen ? 'close' : 'chevron'} className={`w-4 h-4 text-text-muted group-hover:text-brand-accent transition-all ${isModelDropdownOpen ? '' : 'rotate-90'}`} />
                </div>

                {isModelDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-reveal">
                        <div className="p-3 bg-background-secondary border-b border-border-subtle">
                           <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-2">Squad Members ({selectedModels.length})</div>
                           <div className="flex flex-wrap gap-1.5">
                               {selectedModels.map(model => (
                                   <div key={model.id} className="flex items-center gap-1.5 bg-card border border-border-subtle rounded-lg px-2 py-1 pr-1 group">
                                       <img src={getProviderLogo(model.provider)} className="w-3.5 h-3.5 object-contain" alt="" />
                                       <span className="text-[10px] font-semibold text-text-primary">{model.name}</span>
                                       <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); toggleModel(model.id); }}
                                          className="text-text-muted hover:text-error transition-colors p-0.5"
                                        >
                                           <Icon name="close" className="w-2.5 h-2.5" />
                                       </button>
                                   </div>
                               ))}
                           </div>
                        </div>

                        <div className="p-3 border-b border-border-subtle bg-background-secondary">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search models (e.g. GPT-4, Claude...)"
                                    value={modelSearch}
                                    onChange={(e) => setModelSearch(e.target.value)}
                                    className="w-full bg-card border border-border-subtle rounded-lg px-3 py-2 pr-9 text-sm text-text-primary focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="absolute right-3 top-2.5">
                                    <Icon name="search" className="w-4 h-4 text-text-muted" />
                                </div>
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {filteredModels.length > 0 ? filteredModels.map(model => (
                                <div
                                    key={model.id}
                                    onClick={() => toggleModel(model.id)}
                                    className={`p-4 flex items-center justify-between hover:bg-background-tertiary cursor-pointer transition-all ${selectedModelIds.includes(model.id) ? 'bg-brand-primary/5' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={getProviderLogo(model.provider)} className="w-6 h-6 object-contain" alt="" />
                                            {selectedModelIds.includes(model.id) && (
                                                <div className="absolute -top-1 -right-1 bg-brand-accent text-white rounded-full p-0.5 border border-card">
                                                    <Icon name="sparkles" className="w-2 h-2" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-text-primary">{model.name}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="text-[10px] text-text-muted uppercase font-semibold">{model.providerName}</div>
                                                {model.contextWindow && (
                                                    <span className="text-[9px] bg-background-tertiary text-text-secondary px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                                        {Math.round(model.contextWindow / 1024)}k ctx
                                                    </span>
                                                )}
                                                {model.pricing && (
                                                    <span className="text-[9px] text-success font-semibold">
                                                        ${model.pricing.prompt}/M prompt
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedModelIds.includes(model.id) && (
                                        <span className="bg-brand-primary text-[10px] text-white px-2 py-0.5 rounded-full font-black shadow-sm">
                                            {selectedModelIds[0] === model.id ? 'LEAD' : 'CRITIC'}
                                        </span>
                                    )}
                                </div>
                            )) : (
                                <div className="p-8 text-center text-text-muted text-sm italic">No models found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <EngineStatus selectedProvider={selectedModels[0]?.provider || ''} />

            {/* Prompt */}
            <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="userInput" className="block text-lg font-semibold text-text-primary">
                      {modeConfig[mode].label}
                  </label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isListening
                        ? 'bg-error/10 text-error border-error/40 animate-pulse shadow-md'
                        : 'bg-background-secondary text-text-secondary border-border-subtle hover:bg-background-tertiary hover:text-text-primary'
                    }`}
                    title="Voice Input (Speech to Text)"
                    disabled={disabled}
                  >
                    <Icon name={isListening ? 'stop' : 'microphone'} className="w-4 h-4" />
                    <span>{isListening ? 'Listening... (Click to Stop)' : 'Voice Input'}</span>
                  </button>
                </div>
                <textarea
                    id="userInput"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={modeConfig[mode].placeholder}
                    className="input-field max-h-64 min-h-[100px] resize-y"
                    rows={3}
                    disabled={disabled}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                    {PROMPT_EXAMPLES.map(example => (
                        <button
                            key={example}
                            type="button"
                            onClick={() => setUserInput(example)}
                            className="chip text-[10px] py-1"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 text-sm">
                {/* Deep analysis */}
                <Tooltip text={t(language, 'tipDeepAnalysis')} position="bottom">
                  <label className="flex items-center gap-3 p-3.5 bg-background-secondary rounded-xl cursor-pointer hover:bg-background-tertiary transition-colors w-full border border-border-subtle">
                      <input
                          type="checkbox"
                          checked={enableThinking}
                          onChange={(e) => setEnableThinking(e.target.checked)}
                          className="h-4 w-4 rounded border-border-subtle bg-background-tertiary text-brand-primary focus:ring-brand-primary accent-[var(--brand)]"
                      />
                      <span className="flex items-center font-medium text-text-secondary">
                          <Icon name="brain-circuit" className="w-5 h-5 mr-2 text-brand-primary"/>
                          {t(language, 'deepAnalysis')}
                      </span>
                  </label>
                </Tooltip>

                {/* Categories & keywords */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <Tooltip text={t(language, 'tipCategories')} position="bottom">
                            <label className={`${labelClass} mb-2`}>{t(language, 'categoriesLabel')}</label>
                        </Tooltip>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    disabled={disabled}
                                    data-active={selectedCategories.includes(cat.id)}
                                    className="chip"
                                >
                                    {t(language, cat.labelKey as any) || cat.id}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Tooltip text={t(language, 'tipKeywords')} position="bottom">
                            <label htmlFor="trendKeywords" className={`${labelClass} mb-2`}>{t(language, 'keywordsLabel')}</label>
                        </Tooltip>
                        <div className="space-y-2">
                            <input
                                type="text"
                                id="trendKeywords"
                                value={trendKeywords}
                                onChange={(e) => setTrendKeywords(e.target.value)}
                                placeholder={t(language, 'keywordsPlaceholder')}
                                className="input-field"
                                disabled={disabled}
                            />
                            <div className="flex flex-wrap gap-2">
                                {TRENDS.map(trend => (
                                    <button
                                        key={trend}
                                        type="button"
                                        onClick={() => setTrendKeywords(prev => prev.includes(trend) ? prev.replace(trend, '').trim() : `${prev} ${trend}`.trim())}
                                        className="chip text-[10px] py-1"
                                    >
                                        + {trend}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location / audience / model / inspiration */}
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor="locationInput" className={labelClass}>{t(language, 'locationLabel')}</label>
                            <Tooltip text={t(language, 'tipLocation')}>
                                <Icon name="info" className="w-3.5 h-3.5 text-text-muted cursor-help" />
                            </Tooltip>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                id="locationInput"
                                value={locationQuery}
                                onChange={(e) => {
                                    setLocationQuery(e.target.value);
                                    if (locationStatus !== 'idle') setLocationStatus('idle');
                                }}
                                placeholder={t(language, 'locationPlaceholder')}
                                className="input-field flex-1"
                                disabled={disabled}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleGeocode}
                                    disabled={disabled || !locationQuery || locationQuery.includes(',')}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-background-tertiary hover:bg-background-secondary text-text-primary rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-border-subtle"
                                >
                                    {locationStatus === 'loading' && !locationQuery.includes(',') ? (
                                        <div className="w-3 h-3 border-2 border-text-primary border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Icon name="search" className="w-3.5 h-3.5" />
                                    )}
                                    Find City
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={disabled || locationStatus === 'loading'}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${
                                        locationStatus === 'success'
                                        ? 'bg-quadrant-strength/15 text-quadrant-strength border-quadrant-strength/40'
                                        : 'bg-success/10 text-success border-success/25 hover:bg-success/20'
                                    }`}
                                >
                                    {locationStatus === 'loading' && locationQuery.includes(',') ? (
                                        <div className="w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Icon name="location" className="w-3.5 h-3.5" />
                                    )}
                                    {locationStatus === 'success' ? 'Located' : 'My GPS'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="targetAudience" className={labelClass}>Target Audience</label>
                        <select
                            id="targetAudience"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="input-field appearance-none cursor-pointer text-sm"
                            disabled={disabled}
                        >
                            <option value="General">General / Broad</option>
                            <option value="Gen Z (1997-2012)">Gen Z (Teens & Young Adults)</option>
                            <option value="Millennials (1981-1996)">Millennials</option>
                            <option value="Baby Boomers & Seniors">Baby Boomers & Seniors</option>
                            <option value="B2B / Enterprise">B2B / Enterprise</option>
                            <option value="Small Business Owners">Small Business Owners</option>
                            <option value="High Net Worth Individuals">High Net Worth / Luxury</option>
                            <option value="Parents / Families">Parents & Families</option>
                            <option value="Students">Students / Academic</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="businessModel" className={labelClass}>Business Model</label>
                        <select
                            id="businessModel"
                            value={businessModel}
                            onChange={(e) => setBusinessModel(e.target.value)}
                            className="input-field appearance-none cursor-pointer text-sm"
                            disabled={disabled}
                        >
                            <option value="Any">Any / Auto-Suggest</option>
                            <option value="SaaS / Subscription">SaaS / Subscription</option>
                            <option value="Marketplace (2-sided)">Marketplace (2-sided)</option>
                            <option value="Direct-to-Consumer (D2C)">Direct-to-Consumer (D2C)</option>
                            <option value="Freemium + Upsell">Freemium + Upsell</option>
                            <option value="B2B Enterprise Contract">B2B Enterprise Contract</option>
                            <option value="Pay-per-use / Transactional">Pay-per-use / Transactional</option>
                            <option value="Affiliate / Lead Gen">Affiliate / Lead Gen</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-1">
                            <label htmlFor="contentUrlInput" className={labelClass}>{t(language, 'inspirationLabel')}</label>
                            <Tooltip text={t(language, 'tipInspiration')}>
                                <Icon name="info" className="w-3.5 h-3.5 text-text-muted cursor-help shrink-0" />
                            </Tooltip>
                        </div>
                        <div className="space-y-2">
                            <input
                                type="url"
                                id="contentUrlInput"
                                value={contentUrl}
                                onChange={(e) => setContentUrl(e.target.value)}
                                placeholder={t(language, 'inspirationPlaceholder')}
                                className="input-field"
                                disabled={disabled}
                            />
                            <div className="flex flex-wrap gap-2">
                                {INSPIRATION_PRESETS.map(preset => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setContentUrl(preset)}
                                        className="chip text-[10px] py-1 border-brand-primary/25 text-brand-primary bg-brand-primary/5"
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={disabled}
                className="btn-primary mt-4 w-full text-base py-4"
            >
                <Icon name="idea" className="w-5 h-5" />
                {disabled ? t(language, 'generating') : modeConfig[mode].buttonText}
            </button>
        </form>
    </div>
  );
};
