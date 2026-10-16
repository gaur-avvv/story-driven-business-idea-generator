import React, { useState } from 'react';
import { Icon } from './Icon';
import { getProviderLogo } from '../services/modelService';
import { Tooltip } from './Tooltip';
import { useDialog } from '../hooks/useDialog';

interface ApiKeyDialogProps {
    isOpen: boolean;
    providerId: string;
    modelNames: string[];
    onSave: (apiKey: string) => void;
    onCancel: () => void;
}

const PROVIDERS = {
    'google': 'Google Gemini',
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'mistral': 'Mistral AI',
    'groq': 'Groq',
    'together': 'Together AI',
    'togetherai': 'Together AI',
    'cohere': 'Cohere',
    'perplexity': 'Perplexity',
    'deepseek': 'DeepSeek',
    'siliconflow': 'Silicon Flow',
    'pollinations': 'Pollinations AI (Free)',
    'jan': 'Jan (Local Gemma)',
} as Record<string, string>;

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ isOpen, providerId, modelNames, onSave, onCancel }) => {
    const [apiKey, setApiKey] = useState('');
    const dialogRef = useDialog(isOpen, onCancel);

    const providerName = PROVIDERS[providerId] || providerId;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(apiKey);
        setApiKey('');
    };

    const isFreeProvider = providerId === 'pollinations';
    const isJan = providerId === 'jan';

    return (
        <dialog ref={dialogRef} aria-label={`${providerName} API key`} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
            <div className="dialog-panel card-raised p-6 md:p-8 w-[min(32rem,92vw)] relative">
                <button onClick={onCancel} className="absolute top-4 right-4 icon-btn" aria-label="Close">
                    <Icon name="close" className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center justify-center text-center mb-6">
                    <img src={getProviderLogo(providerId)} alt={providerName} className="w-16 h-16 object-contain mb-4 bg-card rounded-xl p-2 border border-border-subtle shadow-sm" />
                    <h2 className="text-2xl font-display font-bold text-text-primary">{providerName} API Key Required</h2>
                    <p className="text-sm text-text-secondary mt-2">
                        You selected {modelNames.join(', ')}. To use this model, please enter your API key for {providerName}.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="apiKey" className="font-bold text-sm text-text-primary">
                                API Key
                            </label>
                            <Tooltip text={'Keys are stored locally in your browser.'} position="top">
                                <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded font-bold border border-brand-primary/20">SECURE LOCAL STORAGE</span>
                            </Tooltip>
                        </div>
                        <input
                            type={isJan ? 'url' : 'password'}
                            id="apiKey"
                            autoFocus
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="input-field"
                            placeholder={isJan ? 'http://localhost:1337/v1 (leave blank for default)' : `Enter your ${providerName} API key...`}
                            required={!isFreeProvider && !isJan}
                        />
                        {isFreeProvider && (
                            <p className="text-xs text-text-muted mt-2">
                                Note: This provider is free and doesn't explicitly require an API key. You can leave this blank.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            Save Key & Proceed
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};
