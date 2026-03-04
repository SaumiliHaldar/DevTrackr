import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface OverviewProps {
  stats: {
    total_commits: number;
    total_repos: number;
    total_prs: number;
  };
  repos: any[];
  isSyncing: boolean;
  onSync: () => void;
}

const Overview: React.FC<OverviewProps> = ({ stats, repos, isSyncing, onSync }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 20 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full p-4 md:p-8"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none mb-2 text-primary">Overview</h1>
          <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            <span>Workspace</span>
            <span className="opacity-30 font-normal">/</span>
            <span className="text-black">Overview</span>
          </div>
        </div>
        <div className="flex gap-3">
           <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSync} 
            disabled={isSyncing} 
            className="w-full md:w-auto px-5 py-3 md:py-2.5 bg-black text-white text-[10px] uppercase tracking-[0.2em] font-black hover:bg-black/90 transition-all disabled:opacity-50 text-center"
          >
            {isSyncing ? 'Processing Data...' : 'Sync GitHub'}
          </motion.button>
        </div>
      </motion.header>

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { label: 'Commits', value: stats.total_commits, icon: true },
              { label: 'Repos', value: stats.total_repos },
              { label: 'Rank', value: `L${Math.floor(stats.total_commits / 100) + 1}` }
            ].map((stat) => (
              <motion.div 
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white border border-black/5 p-6 relative group overflow-hidden"
              >
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground block mb-4 md:mb-6">{stat.label}</span>
                <div className="text-4xl md:text-5xl font-black tracking-tightest leading-tight">{stat.value}</div>
                {stat.icon && (
                  <div className="absolute top-0 right-0 p-2 opacity-5 hidden sm:block">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-black/5">
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-black">Recent Activity</h2>
              <a href="#" className="hidden sm:block text-[9px] uppercase font-bold text-muted-foreground hover:text-black">View All</a>
            </div>
            <div className="divide-y divide-black/5">
              <AnimatePresence mode="popLayout" initial={false}>
                {repos.length > 0 ? repos.map((repo) => (
                  <motion.div 
                    key={repo.id} 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="p-4 flex items-center justify-between hover:bg-black/[0.01] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-8 h-8 md:w-8 md:h-8 bg-black/5 flex items-center justify-center font-bold text-[10px] shrink-0"
                      >
                        {repo.language?.charAt(0) || '•'}
                      </motion.div>
                      <div className="overflow-hidden">
                        <div className="text-[11px] md:text-[11px] font-black uppercase tracking-tight mb-0.5 truncate">{repo.name}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-widest truncate opacity-70">
                          {repo.language || 'Code'} • {repo.stargazersCount} Stars
                        </div>
                      </div>
                    </div>
                    <motion.svg 
                      animate={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      className="hidden sm:block w-4 h-4 text-black/20 shrink-0" 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </motion.svg>
                  </motion.div>
                )) : (
                  <motion.div variants={itemVariants} className="p-12 text-center text-muted-foreground text-[10px] uppercase tracking-widest">
                    No repositories analyzed. Sync to begin.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-black text-white p-6 relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10">
              <span className="text-[8px] uppercase tracking-[0.4em] font-black opacity-60 block mb-6">Performance</span>
              <h3 className="text-base md:text-lg font-black tracking-tightest uppercase mb-2">Raw Throughput</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-50 leading-relaxed mb-6">
                Deep-dive into your coding velocity and commit density.
              </p>
              <button className="text-[9px] font-black uppercase tracking-[0.3em] underline underline-offset-4 decoration-white/20 hover:decoration-white transition-all">Details</button>
            </div>
            <motion.div 
              animate={{ rotate: [45, 90, 45] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute top-0 right-0 w-32 h-32 bg-white/5 rotate-45 translate-x-12 -translate-y-12 hidden md:block"
            ></motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white border border-black/5 p-6">
            <span className="text-[8px] uppercase tracking-[0.4em] font-black text-muted-foreground block mb-6">Security Stream</span>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className="flex gap-3"
                >
                  <div className="w-1 h-3 bg-black/10 mt-1"></div>
                  <div>
                    <div className="text-[10px] uppercase font-bold mb-0.5">Check {i+1}</div>
                    <div className="text-[8px] text-muted-foreground uppercase">Stable</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;
