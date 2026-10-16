import React from 'react';
import { Icon } from './Icon';
import { t, Language } from '../utils/i18n';

interface WelcomeProps {
    language: Language;
}

const Feature: React.FC<{ index: string; icon: string; title: string; i: number; children: React.ReactNode }> = ({ index, icon, title, i, children }) => (
  <div
    className="sheen relative p-6 rounded-2xl border border-border-subtle bg-card/60 backdrop-blur-sm hover:bg-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
    style={{ ['--i' as any]: i }}
  >
    <div className="flex items-start justify-between mb-4">
      <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 group-hover:bg-gradient-brand group-hover:text-white group-hover:border-transparent transition-all">
        <Icon name={icon} className="w-5 h-5" />
      </span>
      <span className="mono-num text-xs text-text-muted">{index}</span>
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-2 leading-snug">{title}</h3>
    <p className="text-text-secondary leading-relaxed text-[0.95rem]">{children}</p>
  </div>
);

export const Welcome: React.FC<WelcomeProps> = ({ language }) => {
  return (
    <section className="animate-reveal">
      {/* Hero */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <span className="eyebrow">Idea Studio</span>
          <span className="h-px flex-1 bg-border-subtle rule-sweep"></span>
        </div>

        <h2 className="font-display font-extrabold text-text-primary leading-[1.02] tracking-tight text-[clamp(1.7rem,5vw,3.2rem)] max-w-[18ch]">
          {t(language, 'welcomeTitle')}
        </h2>

        <div className="mt-7 grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-12 items-start">
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-[46ch]">
            {t(language, 'welcomeDescription')}
          </p>
          <div className="md:pt-2">
            <div className="inline-flex flex-col gap-1 border-l-2 border-brand-accent pl-4">
              <span className="eyebrow text-brand-accent">Grounded in Live Data</span>
              <span className="text-sm text-text-secondary max-w-[30ch]">
                Real-time market signals via SerpApi, drafted by local Gemma or the cloud.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="mt-14 grid sm:grid-cols-2 gap-5 stagger">
        <Feature index="01" icon="market" title={t(language, 'feature1Title')} i={0}>
          {t(language, 'feature1Description')}
        </Feature>
        <Feature index="02" icon="book" title={t(language, 'feature2Title')} i={1}>
          {t(language, 'feature2Description')}
        </Feature>
        <Feature index="03" icon="story" title={t(language, 'feature3Title')} i={2}>
          {t(language, 'feature3Description')}
        </Feature>
        <Feature index="04" icon="play" title={t(language, 'feature4Title')} i={3}>
          {t(language, 'feature4Description')}
        </Feature>
      </div>

      <p className="mt-14 text-sm text-text-muted border-t border-border-subtle pt-5">
        {t(language, 'welcomeReady')}
      </p>
    </section>
  );
};
