import React from 'react';
import type { HistoryItem } from '../types';
import { Icon } from './Icon';
import { t, Language } from '../utils/i18n';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  language: Language;
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

const formatRelativeTime = (timestamp: number, language: Language) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);

    if (mins < 1) return t(language, 'justNow');
    if (mins < 60) return `${mins}${t(language, 'minutesAgo')}`;
    if (hours < 24) return `${hours}${t(language, 'hoursAgo')}`;
    return new Date(timestamp).toLocaleDateString();
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  language,
  onSelectItem,
  onDeleteItem,
  onClearHistory
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-card/85 backdrop-blur-xl border-r border-border-subtle z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-text-primary flex items-center">
            <Icon name="history" className="w-5 h-5 mr-3 text-brand-primary" />
            {t(language, 'historyTitle')}
          </h2>
          <button onClick={onClose} className="icon-btn">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Icon name="sparkles" className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{t(language, 'noHistory')}</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group relative bg-background-secondary rounded-xl border border-border-subtle hover:border-brand-primary/50 transition-all p-4 cursor-pointer hover:shadow-lg"
                onClick={() => onSelectItem(item)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.mode === 'new'
                      ? 'bg-brand-accent/15 text-brand-accent'
                      : 'bg-brand-primary/12 text-brand-primary'
                  }`}>
                    {item.mode}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {formatRelativeTime(item.timestamp, language)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors">
                  {item.idea.idea}
                </h3>
                <p className="text-[11px] text-text-secondary line-clamp-1 italic">
                  {item.params.userInput || "No topic"}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 bg-error/12 text-error hover:bg-error/25 rounded-md transition-all"
                  aria-label={t(language, 'deleteItem')}
                >
                  <Icon name="trash" className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-border-subtle">
            <button
              onClick={onClearHistory}
              className="w-full py-2.5 px-4 rounded-lg bg-background-tertiary hover:bg-error/12 hover:text-error text-text-secondary text-sm font-medium transition-colors flex items-center justify-center border border-border-subtle"
            >
              <Icon name="trash" className="w-4 h-4 mr-2" />
              {t(language, 'clearHistory')}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
