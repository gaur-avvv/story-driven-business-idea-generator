import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { t, Language } from '../utils/i18n';
import type { ProviderSettings } from '../types';
import { getProviderLogo } from '../services/modelService';
import { useDialog } from '../hooks/useDialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ProviderSettings) => void;
  currentSettings: ProviderSettings;
  language: Language;
}

const PROVIDERS = [
    { id: 'google', name: 'Google Gemini' },
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'mistral', name: 'Mistral AI' },
    { id: 'groq', name: 'Groq' },
    { id: 'together', name: 'Together AI' },
    { id: 'cohere', name: 'Cohere' },
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'siliconflow', name: 'Silicon Flow' },
    { id: 'pollinations', name: 'Pollinations AI (Free)' },
    { id: 'jan', name: 'Jan (Local Gemma) — base URL, optional' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings, language }) => {
  const [settings, setSettings] = useState<ProviderSettings>(currentSettings);
  const dialogRef = useDialog(isOpen, onClose);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  const handleKeyChange = (providerId: string, apiKey: string) => {
    setSettings(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        apiKey,
        enabled: true
      }
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <dialog ref={dialogRef} aria-label="Provider settings" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog-panel card-raised p-6 md:p-8 w-[min(34rem,94vw)] relative max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 icon-btn" aria-label="Close">
          <Icon name="close" className="w-6 h-6" />
        </button>

        <div className="mb-6 pr-10">
            <h2 className="text-3xl font-display font-bold text-text-primary tracking-tight">{t(language, 'settingsTitle')}</h2>
            <p className="text-sm text-text-secondary mt-2">Configure your AI providers and API keys</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {PROVIDERS.map((provider) => (
            <div key={provider.id} className="p-4 bg-background-secondary rounded-xl border border-border-subtle hover:border-border-strong/40 transition-colors">
               <div className="flex items-center gap-3 mb-3">
                  <img src={getProviderLogo(provider.id)} alt={provider.name} className="w-6 h-6 object-contain drop-shadow-md" />
                  <div className="flex items-center gap-2">
                    <label htmlFor={`key-${provider.id}`} className="font-bold text-text-primary text-sm tracking-wide">
                      {provider.name}
                    </label>
                    <Tooltip text={t(language, 'tipApiStorage')} position="right">
                        <Icon name="info" className="w-3.5 h-3.5 text-text-muted cursor-help" />
                    </Tooltip>
                  </div>
               </div>
               <div className="relative">
                 <input
                   type="password"
                   id={`key-${provider.id}`}
                   value={settings[provider.id]?.apiKey || ''}
                   onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                   className="input-field pr-16 text-sm"
                   placeholder={t(language, 'apiKeyPlaceholder')}
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {settings[provider.id]?.apiKey ? (
                       <span className="badge bg-success/12 text-success border-success/25">Set</span>
                    ) : (
                       <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Missing</span>
                    )}
                 </div>
               </div>
            </div>
          ))}

          <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl mt-6">
             <h4 className="font-bold text-brand-primary text-xs mb-1 uppercase tracking-widest flex items-center gap-2">
                <Icon name="info" className="w-3.5 h-3.5" /> Note
             </h4>
             <p className="text-xs text-text-secondary leading-relaxed pl-5">
                API keys are stored locally in your browser. Google Gemini fallback is used if no key is provided.
             </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3 pt-4 border-t border-border-subtle">
            <button
                onClick={handleSave}
                className="btn-primary flex-1"
            >
                {t(language, 'saveKeyButton')}
            </button>
            <button
                onClick={onClose}
                className="btn-ghost px-6"
            >
                Cancel
            </button>
        </div>
      </div>
    </dialog>
  );
};
