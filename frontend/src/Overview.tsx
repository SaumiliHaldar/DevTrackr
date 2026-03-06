import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface OverviewProps {
  stats: {
    total_commits: number;
    total_repos: number;
    total_prs: number;
    merged_prs?: number;
    pr_merge_rate?: number;
    languages?: Record<string, number>;
  };
  repos: any[];
  isSyncing: boolean;
  isLoading?: boolean;
  onSync: () => void;
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

const Overview: React.FC<OverviewProps> = ({ stats, repos, isSyncing, isLoading = false, onSync }) => {
  const getLanguageData = () => {
    const counts: Record<string, number> = {};
    repos.forEach(repo => {
      if (repo.language) {
        counts[repo.language] = (counts[repo.language] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const languageData = getLanguageData();
  const COLORS = ['#000000', '#3D3D3D', '#6B6B6B', '#9E9E9E', '#BDBDBD'];

  const statCards = [
    { label: 'Total Commits', value: stats.total_commits.toLocaleString(), sub: 'All time' },
    { label: 'Repositories', value: stats.total_repos.toLocaleString(), sub: 'Synced' },
    { label: 'Pull Requests', value: stats.total_prs.toLocaleString(), sub: `${stats.pr_merge_rate ?? 0}% merged` },
    { label: 'Dev Rank', value: `L${Math.floor(stats.total_commits / 100) + 1}`, sub: 'Performance level' },
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
            <span className="text-black font-bold">Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">Overview</h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSync} 
          disabled={isSyncing} 
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-black/90 transition-all disabled:opacity-40 shrink-0 self-start sm:self-auto"
        >
          {isSyncing ? (
            <>
              <motion.span 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
              />
              Syncing...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync GitHub
            </>
          )}
        </motion.button>
      </motion.header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 sm:gap-6">
          
          {/* Stat Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white border border-black/8 p-6 relative overflow-hidden">
                    <div className="h-3 w-20 bg-black/6 rounded mb-5 animate-pulse" />
                    <div className="h-10 w-16 bg-black/8 rounded mb-3 animate-pulse" />
                    <div className="h-2.5 w-14 bg-black/5 rounded animate-pulse" />
                  </div>
                ))
              : statCards.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.07)' }}
                  transition={{ duration: 0.18 }}
                  className="bg-white border border-black/8 p-6 relative overflow-hidden group"
                >
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">{stat.label}</p>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-2">{stat.value}</div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.sub}</p>
                  <div className={`absolute bottom-0 right-0 w-14 h-14 border-b-2 border-r-2 ${i === 0 ? 'border-black/8' : 'border-black/5'} translate-x-4 translate-y-4`} />
                </motion.div>
              ))
            }
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="bg-white border border-black/8">
            <div className="px-5 py-4 border-b border-black/8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-widest">Recent Repositories</h2>
              </div>
              <NavLink to="/dashboard/repositories" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-black transition-colors">View All →</NavLink>
            </div>

            <div className="divide-y divide-black/5">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-black/6 shrink-0 animate-pulse" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-3 w-32 bg-black/8 rounded animate-pulse" />
                      <div className="h-2.5 w-20 bg-black/5 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {repos.length > 0 ? repos.map((repo) => (
                    <motion.div 
                      key={repo.githubId ?? repo.id ?? repo.name} 
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 100, damping: 22 }}
                      className="px-5 py-4 flex items-center justify-between hover:bg-black/[0.015] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 bg-black/6 flex items-center justify-center font-black text-sm shrink-0">
                          {repo.language?.charAt(0) || '-'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm font-bold uppercase tracking-tight truncate group-hover:translate-x-0.5 transition-transform">{repo.name}</div>
                          <div className="text-xs text-muted-foreground truncate font-medium">
                            {repo.language || 'Code'} · {repo.stargazersCount ?? 0} stars
                          </div>
                        </div>
                      </div>
                      <a 
                        href={repo.htmlUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-black/20 shrink-0 group-hover:text-black/50 group-hover:translate-x-1 transition-all"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View ${repo.name} on GitHub`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </motion.div>
                  )) : (
                    <motion.div variants={itemVariants} className="py-16 text-center">
                      <div className="w-10 h-10 bg-black/5 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-5 h-5 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground">No repositories yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "Sync GitHub" above to import your repositories</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5 sm:gap-6">
          {/* Performance Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-black text-white p-7 relative overflow-hidden cursor-pointer"
          >
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-widest font-bold opacity-50 block mb-5">Performance</span>
              <h3 className="text-xl font-black tracking-tight uppercase mb-3">Raw Throughput</h3>
              <p className="text-xs uppercase tracking-wider opacity-50 leading-relaxed mb-6">
                Deep-dive into your coding velocity and commit density across all repositories.
              </p>
              <NavLink 
                to="/dashboard/analytics"
                className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 decoration-white/25 hover:decoration-white transition-all inline-block"
              >
                View Details →
              </NavLink>
            </div>
            <motion.div 
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute -top-8 -right-8 w-28 h-28 border-2 border-white/8 rounded-full"
            />
            <motion.div 
              animate={{ rotate: [360, 0] }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/5"
            />
          </motion.div>

          {/* Tech Stack Chart */}
          <motion.div variants={itemVariants} className="bg-white border border-black/8 p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Tech Stack</span>
              <span className="text-xs text-muted-foreground font-medium">{languageData.length} languages</span>
            </div>
            <div className="flex-1 min-h-[13rem] relative flex items-center justify-center">
              {isLoading ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 's1', value: 40 },
                          { name: 's2', value: 25 },
                          { name: 's3', value: 35 }
                        ]}
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1000}
                      >
                        {[0, 1, 2].map((i) => (
                          <Cell key={`cell-${i}`} fill="#f5f5f5" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-[140px] h-[140px] rounded-full border-[22px] border-black/[0.03]" />
                    </div>
                  </motion.div>
                </div>
              ) : languageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {languageData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[languageData.indexOf(entry) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        color: '#fff', 
                        fontSize: '11px', 
                        border: 'none', 
                        borderRadius: '0', 
                        textTransform: 'uppercase', 
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '8px 12px'
                      }}
                      itemStyle={{ color: '#fff' }}
                      cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 bg-black/5 flex items-center justify-center mb-4 rounded-full">
                    <svg className="w-6 h-6 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-black mb-1">No Data Detected</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-relaxed">
                    Sync with GitHub to identify your tech stack distribution
                  </p>
                </div>
              )}
            </div>
            {isLoading ? (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-black/5 shrink-0 animate-pulse" />
                    <div className="h-2.5 w-12 bg-black/5 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : languageData.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                {languageData.slice(0, 4).map((lang, i) => (
                  <div key={lang.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-muted-foreground font-medium">{lang.name}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;
