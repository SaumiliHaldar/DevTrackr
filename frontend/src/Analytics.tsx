import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface AnalyticsProps {
  activityData: number[];
  insight: string | null;
  isGeneratingInsight: boolean;
  onGenerateInsight: (force?: boolean) => void;
  isLoading?: boolean;
  stats?: {
    total_commits: number;
    total_repos: number;
    total_prs: number;
    merged_prs?: number;
    pr_merge_rate?: number;
    productivity_score?: number;
  };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 } 
  }
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 22 }
  }
};

const Analytics: React.FC<AnalyticsProps> = ({ activityData, insight, isGeneratingInsight, onGenerateInsight, isLoading = false, stats }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const generationAttempted = React.useRef(false);

  React.useEffect(() => {
    if (!insight && !isGeneratingInsight && !generationAttempted.current) {
      generationAttempted.current = true;
      onGenerateInsight();
    }
  }, [insight, isGeneratingInsight, onGenerateInsight]);

  const data = activityData.length > 0 ? activityData : new Array(30).fill(0);
  const maxCommits = Math.max(...data, 1);
  const yAxisTicks = [0, Math.ceil(maxCommits / 2), maxCommits];

  const xAxisLabels = [
    { pos: 0, label: '30d ago' },
    { pos: 10, label: '20d ago', hideOnMobile: true },
    { pos: 20, label: '10d ago', hideOnMobile: true },
    { pos: 30, label: 'Today' },
  ];

  const metrics = [
    { label: 'Commits', value: (stats?.total_commits ?? 0).toLocaleString(), unit: '', desc: 'Total all time' },
    { label: 'PR Merge Rate', value: `${stats?.pr_merge_rate ?? 0}`, unit: '%', desc: `${stats?.merged_prs ?? 0} of ${stats?.total_prs ?? 0} merged` },
    { label: 'Score', value: `${stats?.productivity_score ?? 0}`, unit: 'pts', desc: 'Productivity rating' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full p-5 sm:p-8 max-w-screen-xl"
    >
      {/* Page Header */}
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">
            <span>Workspace</span>
            <span className="opacity-30">/</span>
            <span className="text-black font-bold">Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">Analytics Engine</h1>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-black" />
            <span>Commits / Day</span>
          </div>
          <span className="text-black/15">·</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-12 gap-5 sm:gap-6">
        {/* Chart Panel */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-9 bg-white border border-black/8 p-5 sm:p-8 relative overflow-hidden">
          {/* Grid pattern bg */}
          <div className="absolute inset-0 grid-pattern opacity-[0.025] pointer-events-none" />

          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-black" />
              <h2 className="text-sm font-black uppercase tracking-widest">Commit Activity</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Last 30 days</span>
              <span className="text-xs font-bold bg-black text-white px-2 py-0.5 uppercase tracking-wider">Live</span>
            </div>
          </div>
          
          {/* Chart area */}
          <div className="relative h-56 sm:h-72 md:h-80 flex items-end pl-10 pr-2">
            {/* Y-Axis Labels & Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-10">
              {[...yAxisTicks].reverse().map((tick, i) => (
                <div key={i} className="w-full flex items-center gap-3 -mt-px">
                  <span className="text-xs font-bold text-muted-foreground w-8 text-right tabular-nums -ml-8 shrink-0">{tick}</span>
                  <div className="flex-1 border-t border-black/6" />
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="flex-1 h-full flex items-end gap-0.5 sm:gap-1 relative z-10">
              {data.map((count, i) => (
                <motion.div 
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={() => setHoveredIndex(i)}
                  onTouchEnd={() => setHoveredIndex(null)}
                  initial={{ height: 0 }}
                  animate={{ 
                    height: `${(count / maxCommits) * 100}%`,
                    backgroundColor: hoveredIndex === i ? '#000' : count > 0 ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.06)'
                  }}
                  transition={{ 
                    height: { delay: i * 0.008, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
                    backgroundColor: { duration: 0.1 }
                  }}
                  style={{ minHeight: count > 0 ? '2px' : '0px' }}
                  className="flex-1 relative cursor-pointer group/bar"
                >
                  <AnimatePresence>
                    {hoveredIndex === i && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 2, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white px-2.5 py-1 text-xs font-bold whitespace-nowrap z-30 pointer-events-none"
                      >
                        {count} commit{count !== 1 ? 's' : ''}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between mt-6 relative z-10 pl-10 pr-2">
            {xAxisLabels.map((label, i) => (
              <div key={i} className={`flex flex-col items-center gap-1.5 ${label.hideOnMobile ? 'hidden sm:flex' : 'flex'}`}>
                <div className="w-px h-2 bg-black/15" />
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-3 flex flex-col gap-5 sm:gap-6">
          {/* Aggregated Scores */}
          <div className="bg-white border border-black/8 p-6">
            <h2 className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-6">Performance Scores</h2>
            <div className="flex flex-col gap-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 pb-6 border-b border-black/6 last:border-0">
                    <div className="h-2.5 w-16 bg-black/6 rounded animate-pulse" />
                    <div className="h-7 w-12 bg-black/8 rounded animate-pulse" />
                    <div className="h-2 w-24 bg-black/5 rounded animate-pulse" />
                  </div>
                ))
              ) : metrics.map((m) => (
                <div key={m.label} className="group">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground group-hover:text-black transition-colors">{m.label}</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-black tracking-tight">{m.value}</span>
                      <span className="text-xs font-bold opacity-40">{m.unit}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                  <div className="mt-2 h-px bg-black/6" />
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Insight Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            onClick={!insight && !isGeneratingInsight ? () => onGenerateInsight() : undefined}
            className="bg-black text-white p-6 overflow-hidden relative flex flex-col flex-1"
            style={{ cursor: !insight && !isGeneratingInsight ? 'pointer' : 'default' }}
          >
            <div className="relative z-10 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <h3 className="text-xs font-black tracking-widest uppercase text-white">Analysis Insights</h3>
                </div>
                {insight && !isGeneratingInsight && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onGenerateInsight(true); }}
                    className="p-1 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                    title="Regenerate Insight"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isGeneratingInsight || !insight ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col gap-2.5"
                  >
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                        className={`h-2.5 bg-white/20 rounded-full ${i === 3 ? 'w-1/2' : 'w-full'}`}
                      />
                    ))}
                    <p className="text-xs text-white/50 uppercase tracking-widest font-medium mt-2">
                      {isGeneratingInsight ? 'Analyzing patterns...' : 'Click to generate insight'}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="insight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1"
                  >
                    <p className="text-sm leading-relaxed text-white/85">{insight}</p>
                  </motion.div>
                )}
              </AnimatePresence>


            </div>

            {/* BG decoration */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute -bottom-10 -right-10 w-32 h-32 border-2 border-white/8 rounded-full pointer-events-none"
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
