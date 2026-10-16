import React from 'react';
import { Icon } from './Icon';
import { t, Language } from '../utils/i18n';
import { Tooltip } from './Tooltip';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSettingsClick: () => void;
  onHistoryToggle: () => void;
  showHistoryBadge?: boolean;
}

const LanguageButton: React.FC<{
    lang: Language;
    currentLang: Language;
    onClick: (lang: Language) => void;
    label: string;
}> = ({ lang, currentLang, onClick, label}) => (
    <button
        onClick={() => onClick(lang)}
        aria-pressed={currentLang === lang}
        className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg transition-all ${
            currentLang === lang
            ? 'bg-white text-brand-primary shadow-sm'
            : 'text-white/75 hover:bg-white/15 hover:text-white'
        }`}
    >
        {label}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, onSettingsClick, onHistoryToggle, showHistoryBadge }) => {
  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-4xl px-4 md:px-8 h-16 flex justify-between items-center gap-2">
        {/* Logo & Title */}
        <div
          className="flex items-center gap-3 cursor-pointer group min-w-0"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="flex items-center justify-center w-9 h-9 bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/30 group-hover:bg-white/30 transition-all shadow-md">
            <Icon name="idea" className="w-5 h-5" />
          </span>
          <h1 className="font-display font-bold text-white text-base sm:text-lg leading-tight tracking-tight drop-shadow-sm max-w-[60vw] truncate">
            {t(language, 'headerTitle')}
          </h1>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1 gap-1 shadow-md">
            <Tooltip text={t(language, 'tipLanguage')}>
              <div className="flex gap-1">
                <LanguageButton lang="en" currentLang={language} onClick={onLanguageChange} label={t(language, 'langEn')} />
                <LanguageButton lang="hi" currentLang={language} onClick={onLanguageChange} label={t(language, 'langHi')} />
              </div>
            </Tooltip>
          </div>

          <ThemeToggle language={language} />

          {/* History Button */}
          <Tooltip text={t(language, 'tipHistory')}>
            <button
              onClick={onHistoryToggle}
              className="p-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all border border-transparent hover:border-white/30 relative shadow-sm hover:shadow-md"
              aria-label={t(language, 'history')}
            >
              <Icon name="history" className="w-5 h-5" />
              {showHistoryBadge && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-tertiary rounded-full border-2 border-white shadow-sm"></span>
              )}
            </button>
          </Tooltip>

          {/* Settings Button */}
          <Tooltip text={t(language, 'tipSettings')}>
            <button
              onClick={onSettingsClick}
              className="p-2.5 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all border border-transparent hover:border-white/30 relative shadow-sm hover:shadow-md"
              aria-label={t(language, 'settings')}
            >
              <Icon name="settings" className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
