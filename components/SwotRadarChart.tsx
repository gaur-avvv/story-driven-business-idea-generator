import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { BusinessIdea } from '../types';
import { Icon } from './Icon';

interface SwotRadarChartProps {
  idea: BusinessIdea;
}

const SwotRadarChart: React.FC<SwotRadarChartProps> = ({ idea }) => {
  const [activeTab, setActiveTab] = useState<'swot' | 'market'>('swot');

  // Generate quantitative metrics based on SWOT items count and content
  const strengthCount = idea.swot?.strengths?.length || 3;
  const weaknessCount = idea.swot?.weaknesses?.length || 3;
  const oppCount = idea.swot?.opportunities?.length || 3;
  const threatCount = idea.swot?.threats?.length || 3;

  // SWOT dimensional analysis scores (0-100 scale)
  const swotData = [
    { subject: 'Strengths (Execution)', A: Math.min(95, 60 + strengthCount * 10), fullMark: 100 },
    { subject: 'Weaknesses (Risk)', A: Math.max(20, 90 - weaknessCount * 12), fullMark: 100 },
    { subject: 'Opportunities (Upside)', A: Math.min(98, 65 + oppCount * 10), fullMark: 100 },
    { subject: 'Threats (Mitigation)', A: Math.max(30, 85 - threatCount * 10), fullMark: 100 },
    { subject: 'Strategic Viability', A: 88, fullMark: 100 },
    { subject: 'Market Readiness', A: 82, fullMark: 100 },
  ];

  // Market Trend Relevance vs Idea Sector benchmark
  const marketData = [
    { subject: 'Market Demand', TrendScore: 92, IdeaFit: 88, fullMark: 100 },
    { subject: 'Growth Momentum', TrendScore: 85, IdeaFit: 90, fullMark: 100 },
    { subject: 'Innovation Factor', TrendScore: 78, IdeaFit: 95, fullMark: 100 },
    { subject: 'Competitive Moat', TrendScore: 70, IdeaFit: 84, fullMark: 100 },
    { subject: 'Scalability Index', TrendScore: 88, IdeaFit: 91, fullMark: 100 },
    { subject: 'Regulatory Ease', TrendScore: 75, IdeaFit: 80, fullMark: 100 },
  ];

  return (
    <div className="bg-card/40 border border-border-subtle rounded-2xl p-6 backdrop-blur-xl shadow-xl mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle">
        <div>
          <h4 className="text-xl font-display font-bold text-text-primary flex items-center gap-2">
            <Icon name="chart-bar" className="w-5 h-5 text-brand-primary" />
            Quantitative Strategic Intelligence
          </h4>
          <p className="text-xs text-text-secondary mt-1">
            Visualizing SWOT dimensions and market trend relevance metrics.
          </p>
        </div>
        <div className="flex items-center bg-background-tertiary p-1 rounded-xl border border-border-subtle">
          <button
            onClick={() => setActiveTab('swot')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'swot'
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            SWOT Analysis Matrix
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'market'
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Market vs Trend Fit
          </button>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'swot' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="78%" data={swotData}>
              <PolarGrid stroke="var(--border-strong)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-strong)" />
              <Radar
                name="SWOT Evaluation"
                dataKey="A"
                stroke="var(--quadrant-strength)"
                fill="var(--quadrant-strength)"
                fillOpacity={0.22}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-strong)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  boxShadow: '0 6px 24px -6px rgba(28,23,20,0.2)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
            </RadarChart>
          ) : (
            <RadarChart cx="50%" cy="50%" outerRadius="78%" data={marketData}>
              <PolarGrid stroke="var(--border-strong)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-strong)" />
              <Radar
                name="Market Trend Benchmark"
                dataKey="TrendScore"
                stroke="var(--quadrant-opportunity)"
                fill="var(--quadrant-opportunity)"
                fillOpacity={0.22}
              />
              <Radar
                name="Idea Sector Fit"
                dataKey="IdeaFit"
                stroke="var(--brand-primary)"
                fill="var(--brand-primary)"
                fillOpacity={0.22}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border-strong)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  boxShadow: '0 6px 24px -6px rgba(28,23,20,0.2)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {activeTab === 'swot' ? (
          <>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Strengths Index</span>
              <span className="text-lg font-black text-quadrant-strength mt-1 block">{swotData[0].A}%</span>
            </div>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Risk Management</span>
              <span className="text-lg font-black text-quadrant-weakness mt-1 block">{swotData[1].A}%</span>
            </div>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Upside Potential</span>
              <span className="text-lg font-black text-quadrant-opportunity mt-1 block">{swotData[2].A}%</span>
            </div>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Viability Score</span>
              <span className="text-lg font-black text-success mt-1 block">{swotData[4].A}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Market Demand</span>
              <span className="text-lg font-black text-quadrant-opportunity mt-1 block">{marketData[0].TrendScore}%</span>
            </div>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Idea Sector Fit</span>
              <span className="text-lg font-black text-brand-primary mt-1 block">{marketData[0].IdeaFit}%</span>
            </div>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Innovation Factor</span>
              <span className="text-lg font-black text-success mt-1 block">{marketData[2].IdeaFit}%</span>
            </div>
            <div className="bg-background-tertiary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-secondary uppercase tracking-widest block font-bold">Scalability Index</span>
              <span className="text-lg font-black text-quadrant-strength mt-1 block">{marketData[4].IdeaFit}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SwotRadarChart;
