import React from 'react';
import type { DiscussionMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

interface DiscussionBoardProps {
  messages: DiscussionMessage[];
}

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ messages }) => {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="card sheen rounded-3xl p-8 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-brand opacity-80"></div>

      <div className="flex items-center justify-between mb-10 border-b border-border-subtle pb-6">
        <h3 className="text-3xl font-display font-bold text-text-primary flex items-center tracking-tight">
            <span className="bg-brand-primary/15 p-3 rounded-2xl mr-4 text-brand-primary border border-brand-primary/25">
                <Icon name="brain-circuit" className="w-6 h-6" />
            </span>
            AI Agent Deliberation
        </h3>
        <div className="hidden sm:flex px-4 py-2 bg-success/12 border border-success/30 rounded-full items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Real-time Synthesis</span>
        </div>
      </div>

      <div className="space-y-10 relative">
        <div className="absolute left-[2rem] top-2 bottom-2 w-px bg-linear-to-b from-brand-primary/50 via-border-subtle to-transparent"></div>

        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={`${msg.agentName}-${idx}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="relative flex items-start gap-6 group/msg"
            >
              <div className="relative z-10 shrink-0">
                <div className="relative">
                  <img
                    src={msg.avatar}
                    alt={msg.agentName}
                    className="w-16 h-16 rounded-2xl border border-border-subtle shadow-xl bg-card group-hover/msg:border-brand-primary transition-colors object-cover"
                  />
                  <div className={`absolute -bottom-2 -right-2 flex items-center justify-center w-7 h-7 rounded-xl text-[10px] font-black border border-border-subtle shadow-lg ${idx < (messages.length / 2) ? 'bg-brand-primary text-white' : 'bg-background-secondary text-text-primary'}`}>
                    {idx + 1}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 mt-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-bold text-text-primary text-xl group-hover/msg:text-brand-primary transition-colors tracking-tight">{msg.agentName}</span>
                  <span className="text-[10px] px-3 py-1.5 rounded-lg bg-background-tertiary border border-border-subtle text-text-secondary font-black uppercase tracking-widest">
                    {msg.role}
                  </span>
                </div>
                <div className="bg-background-secondary p-6 rounded-3xl rounded-tl-xl border border-border-subtle shadow-md relative group-hover/msg:border-brand-primary/30 transition-colors">
                  <p className="text-base text-text-primary leading-relaxed font-medium">
                    "{msg.content}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
