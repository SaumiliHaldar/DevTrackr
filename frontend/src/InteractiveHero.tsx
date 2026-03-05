import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATS_DATA = [
  { label: 'TOTAL COMMITS', value: '42', sub: 'ALL TIME' },
  { label: 'REPOSITORIES', value: '7', sub: 'SYNCED' },
  { label: 'PULL REQUESTS', value: '2', sub: '100% MERGED' },
  { label: 'DEV RANK', value: 'L2', sub: 'PERFORMANCE LEVEL' },
];

const REPOS_DATA = [
  { name: 'WEBSITE', lang: 'TypeScript', stars: 12 },
  { name: 'DATABASE', lang: 'Python', stars: 8 },
  { name: 'DOCS-ENGINE', lang: 'Markdown', stars: 3 },
  { name: 'UTILS-LIB', lang: 'TypeScript', stars: 15 },
  { name: 'MOBILE-UI', lang: 'JavaScript', stars: 5 },
];

const ANALYTICS_DATA = [
  1, 0, 2, 1, 3, 1, 2, 4, 2, 1, 0, 1, 2, 3, 2, 1, 2, 0, 1, 2, 1, 1, 2, 1, 0, 2, 3, 1, 1, 2
];

const PERFORMANCE_METRICS = [
  { label: 'COMMITS', value: '42', desc: 'Total all time' },
  { label: 'PR MERGE RATE', value: '100%', desc: '2 of 2 merged' },
  { label: 'SCORE', value: '94 pts', desc: 'Productivity rating' },
];

const InteractiveHero: React.FC = () => {
  const [view, setView] = useState<'stats' | 'repos' | 'analytics'>('stats');

  useEffect(() => {
    const timer = setInterval(() => {
      setView((prev) => {
        if (prev === 'stats') return 'repos';
        if (prev === 'repos') return 'analytics';
        return 'stats';
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="aspect-[4/3] border border-black/8 p-3 sm:p-5 bg-zinc-50 relative group overflow-hidden">
      {/* Skeleton Frame */}
      <div className="w-full h-full border border-black/10 flex flex-col bg-white overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="h-10 border-b border-black/8 px-4 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-black/10 rounded-full" />
            ))}
          </div>
          <div className="text-[10px] font-black tracking-[0.2em] text-black/30 flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-black/30 animate-pulse" />
            {view === 'stats' && 'Workspace / Overview'}
            {view === 'repos' && 'Workspace / Repositories'}
            {view === 'analytics' && 'Workspace / Analytics'}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative p-4 flex flex-col">
          <AnimatePresence mode="wait">
            {view === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="grid grid-cols-2 gap-3 h-full"
              >
                {STATS_DATA.map((stat) => (
                  <div key={stat.label} className="bg-white border border-black/8 p-4 flex flex-col justify-center">
                    <p className="text-[9px] font-bold tracking-widest text-black/40 mb-2 uppercase">{stat.label}</p>
                    <div className="text-2xl font-black tracking-tighter leading-none mb-1">{stat.value}</div>
                    <p className="text-[8px] font-bold tracking-wider text-black/30 uppercase">{stat.sub}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {view === 'repos' && (
              <motion.div
                key="repos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col gap-2 h-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Recent Repositories</h3>
                  <div className="text-[9px] font-bold text-black/30 uppercase tracking-widest">View All →</div>
                </div>
                <div className="divide-y divide-black/5 border border-black/8">
                  {REPOS_DATA.map((repo) => (
                    <div key={repo.name} className="px-3 py-2.5 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-black/5 flex items-center justify-center font-black text-[10px]">
                          {repo.lang.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-tight">{repo.name}</p>
                          <p className="text-[8px] font-bold text-black/30 uppercase">{repo.lang} · {repo.stars} stars</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 text-black/20">→</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col gap-4 h-full"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Commit Activity</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-black/30 uppercase tracking-widest">30 Days</span>
                    <span className="text-[8px] font-black bg-black text-white px-1.5 py-0.5 uppercase tracking-widest">Live</span>
                  </div>
                </div>
                
                {/* Bar Chart */}
                <div className="flex-1 flex items-end gap-0.5 border-b border-l border-black/5 h-24">
                  {ANALYTICS_DATA.map((val, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / 10) * 100}%` }}
                      transition={{ delay: i * 0.01, duration: 0.8 }}
                      className="flex-1 bg-black/80"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PERFORMANCE_METRICS.map((m) => (
                    <div key={m.label} className="border-t border-black/8 pt-2">
                      <p className="text-[8px] font-bold text-black/40 uppercase mb-1">{m.label}</p>
                      <p className="text-sm font-black tracking-tight">{m.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Switcher Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {(['stats', 'repos', 'analytics'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                view === v ? 'bg-black w-4' : 'bg-black/10 hover:bg-black/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute -top-2 -right-2 w-16 h-16 border-t border-r border-black/10 pointer-events-none" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 border-b border-l border-black/10 pointer-events-none" />
    </div>
  );
};

export default InteractiveHero;
