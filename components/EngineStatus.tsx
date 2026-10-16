import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { getAppStatus, AppStatus } from '../services/statusService';
import { checkJanStatus } from '../services/janService';

interface EngineStatusProps {
  selectedProvider: string;
}

const Pill: React.FC<{ active: boolean; label: string; hint?: string }> = ({ active, label, hint }) => (
  <span
    title={hint}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
      active
        ? 'bg-success/10 text-success border-success/30'
        : 'bg-background-tertiary text-text-muted border-border-subtle'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-success' : 'bg-text-muted'}`}></span>
    {label}
  </span>
);

/**
 * Small status strip showing which live capabilities are active:
 * local Gemma (Jan), real-time search (SerpApi), and studio voice (ElevenLabs).
 */
export const EngineStatus: React.FC<EngineStatusProps> = ({ selectedProvider }) => {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [janLive, setJanLive] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [s, j] = await Promise.all([getAppStatus(), checkJanStatus()]);
      if (!alive) return;
      setStatus(s);
      setJanLive(j.available);
    })();
    return () => { alive = false; };
  }, [selectedProvider]);

  if (!status) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="eyebrow mr-1 flex items-center gap-1.5">
        <Icon name="brain-circuit" className="w-3.5 h-3.5" />
        Capabilities
      </span>
      <Pill
        active={janLive === true}
        label={janLive ? 'Local Gemma (Jan)' : 'Local Gemma offline'}
        hint="Run Jan.ai locally with Gemma loaded to enable fully on-device generation."
      />
      <Pill active={status.serpapi} label="Live web research" hint="SerpApi grounds ideas in real-time market signals." />
      <Pill active={status.elevenlabs} label="Studio narration" hint="ElevenLabs voices the story audio." />
    </div>
  );
};
