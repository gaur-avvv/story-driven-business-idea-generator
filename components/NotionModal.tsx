import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import type { BusinessIdea } from '../types';
import { t, Language } from '../utils/i18n';
import { useDialog } from '../hooks/useDialog';

interface NotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: BusinessIdea;
  language: Language;
}

export const NotionModal: React.FC<NotionModalProps> = ({ isOpen, onClose, idea, language }) => {
  const [apiKey, setApiKey] = useState('');
  const [parentId, setParentId] = useState('');
  const [isDatabase, setIsDatabase] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useDialog(isOpen, onClose);

  useEffect(() => {
    const savedKey = localStorage.getItem('notion_api_key') || '';
    const savedParentId = localStorage.getItem('notion_parent_id') || '';
    if (savedKey) setApiKey(savedKey);
    if (savedParentId) setParentId(savedParentId);
  }, [isOpen]);

  const handleSaveToNotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !parentId.trim()) {
      setErrorMessage('Please provide both your Notion API Key and Database/Page ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      localStorage.setItem('notion_api_key', apiKey.trim());
      localStorage.setItem('notion_parent_id', parentId.trim());

      const response = await fetch('/api/notion/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          parentId: parentId.trim(),
          isDatabase,
          idea,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save to Notion.');
      }

      setSuccessMessage('Successfully saved business idea to Notion!');
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving to Notion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog ref={dialogRef} aria-label="Save to Notion" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog-panel card-raised p-6 md:p-8 w-[min(32rem,92vw)] relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 icon-btn" aria-label="Close">
          <Icon name="close" className="w-6 h-6" />
        </button>

        <div className="mb-6 flex items-center gap-3 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shadow-sm shrink-0">
               <Icon name="book" className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
               <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">Save to Notion Workspace</h2>
               <p className="text-xs text-text-secondary mt-1">Export this business idea directly to your Notion database.</p>
            </div>
        </div>

        <form onSubmit={handleSaveToNotion} className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Notion Integration Token (API Key)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="secret_..."
              className="input-field text-sm"
              required
            />
            <p className="text-[11px] text-text-muted mt-1">
              Create an internal integration at <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noreferrer" className="text-brand-primary underline underline-offset-2">notion.so/integrations</a>. Stored locally in your browser.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Notion Database ID or Page ID
            </label>
            <input
              type="text"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              placeholder="e.g. 32-character hex ID from your database URL"
              className="input-field text-sm"
              required
            />
            <p className="text-[11px] text-text-muted mt-1">
              Make sure to share your database with your Notion integration in Notion!
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDatabase"
              checked={isDatabase}
              onChange={(e) => setIsDatabase(e.target.checked)}
              className="w-4 h-4 rounded border-border-subtle bg-background-tertiary text-brand-primary focus:ring-brand-primary accent-[var(--brand)]"
            />
            <label htmlFor="isDatabase" className="text-xs font-semibold text-text-primary cursor-pointer">
              Parent ID is a Database (recommended)
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 bg-error/12 border border-error/25 rounded-xl text-error text-xs leading-relaxed">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-success/12 border border-success/25 rounded-xl text-success text-xs leading-relaxed font-bold flex items-center gap-2">
              <Icon name="check" className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          <div className="pt-4 border-t border-border-subtle flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <Icon name="loading" className="w-4 h-4 animate-spin" />
                  Saving to Notion...
                </>
              ) : (
                <>
                  <Icon name="bookmark" className="w-4 h-4" />
                  Save Idea to Notion
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
