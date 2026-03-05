import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

interface RepositoriesProps {
  repos: any[];
  isLoading?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

interface RepositoryModalProps {
  repo: any;
  onClose: () => void;
}

const RepositoryModal: React.FC<RepositoryModalProps> = ({ repo, onClose }) => {
  const { user } = useUser();
  const [activityData, setActivityData] = useState<number[]>([]);
  const [totalActivityData, setTotalActivityData] = useState<number[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.id || !repo?.name) return;
      setIsLoadingActivity(true);
      try {
        const [repoRes, totalRes] = await Promise.all([
          fetch(`${API_BASE}/activity/${user.id}/${repo.name}`),
          fetch(`${API_BASE}/activity/${user.id}`)
        ]);
        
        if (repoRes.ok) {
          const data = await repoRes.json();
          setActivityData(Array.isArray(data) ? data : []);
        }
        if (totalRes.ok) {
          const totalData = await totalRes.json();
          setTotalActivityData(Array.isArray(totalData) ? totalData : []);
        }
      } catch (e) {
        console.error('Failed to fetch activity data:', e);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    fetchActivity();
  }, [user?.id, repo?.name]);

  const data = activityData.length > 0 ? activityData : new Array(30).fill(0);
  const maxCommits = Math.max(...data, 1);
  const yAxisTicks = [0, Math.ceil(maxCommits / 2), maxCommits];

  // Static Insights Calculation
  const totalCommits = data.reduce((a, b) => a + b, 0);
  const activeDays = data.filter(d => d > 0).length;
  const userTotalCommitsMonth = totalActivityData.reduce((a, b) => a + b, 0);
  
  let staticInsight = "";
  if (totalCommits === 0) {
    staticInsight = "No commit activity detected in the last 30 days. Time to write some code!";
  } else {
    // Calculate percentage
    let percentageString = "";
    if (userTotalCommitsMonth > 0) {
      const percentage = Math.round((totalCommits / userTotalCommitsMonth) * 100);
      percentageString = `This repository accounts for ${percentage}% of your total commit activity this month.`;
    }

    if (activeDays === 1) {
      staticInsight = `You made ${totalCommits} commit${totalCommits > 1 ? 's' : ''} in a single day of focused effort this month. ${percentageString}`;
    } else {
      staticInsight = `Consistent output: ${totalCommits} commits spread across ${activeDays} active days. ${percentageString}`;
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/8 flex items-start justify-between bg-zinc-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl shrink-0">
              {repo.language?.charAt(0) || '-'}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-1">{repo.name}</h2>
              <p className="text-xs text-muted-foreground font-mono">{repo.fullName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto w-full">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Language</div>
              <div className="text-lg font-bold">{repo.language || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Stars</div>
              <div className="text-lg font-bold">{repo.stargazersCount ?? 0}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Forks</div>
              <div className="text-lg font-bold">{repo.forksCount ?? 0}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Updated</div>
              <div className="text-sm font-bold mt-1.5 opacity-80">
                {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>

          {repo.description && (
            <div className="mb-10">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Description</div>
              <p className="text-sm leading-relaxed text-black/80">{repo.description}</p>
            </div>
          )}

          {/* AI Insight Box */}
          <div className="mb-10 bg-black text-white p-6 relative overflow-hidden">
             <div className="relative z-10 flex flex-col h-full">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 bg-white rounded-full" />
                 <h4 className="text-xs font-black tracking-widest uppercase text-white">Repository Insight</h4>
               </div>
               
               <AnimatePresence mode="wait">
                 {isLoadingActivity ? (
                   <motion.div 
                     key="loading"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="flex-1 flex flex-col gap-2.5"
                   >
                     {[1, 2].map(i => (
                       <motion.div 
                         key={i}
                         animate={{ opacity: [0.3, 0.6, 0.3] }}
                         transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                         className={`h-2.5 bg-white/20 rounded-full ${i === 2 ? 'w-3/4' : 'w-full'}`}
                       />
                     ))}
                   </motion.div>
                 ) : (
                   <motion.div
                     key="insight"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="flex-1"
                   >
                     <p className="text-sm leading-relaxed text-white/85">
                       {staticInsight}
                     </p>
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
          </div>

          {/* Activity Graph */}
          <div className="bg-white border border-black/8 p-5 sm:p-6 relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-black" />
                <h3 className="text-xs font-black uppercase tracking-widest">30-Day Activity</h3>
              </div>
              {isLoadingActivity && (
                <span className="text-xs font-semibold text-muted-foreground animate-pulse">Loading data...</span>
              )}
            </div>

            <div className="relative h-48 flex items-end pl-8 pr-1">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-8">
                {[...yAxisTicks].reverse().map((tick, i) => (
                  <div key={i} className="w-full flex items-center gap-3 -mt-px">
                    <span className="text-[10px] font-bold text-muted-foreground w-6 text-right tabular-nums -ml-6 shrink-0">{tick}</span>
                    <div className="flex-1 border-t border-black/6" />
                  </div>
                ))}
              </div>

              <div className="flex-1 h-full flex items-end gap-0.5 relative z-10 w-full">
                {data.map((count, i) => (
                  <motion.div 
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${(count / maxCommits) * 100}%`,
                      backgroundColor: hoveredIndex === i ? '#000' : count > 0 ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.06)'
                    }}
                    transition={{ height: { delay: i * 0.005, duration: 0.6 } }}
                    style={{ minHeight: count > 0 ? '2px' : '0px' }}
                    className="flex-1 relative cursor-default"
                  >
                    <AnimatePresence>
                      {hoveredIndex === i && (
                        <motion.div 
                          initial={{ opacity: 0, y: 4, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 text-[10px] font-bold whitespace-nowrap z-30"
                        >
                          {count} commit{count !== 1 ? 's' : ''}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            {repo.htmlUrl && (
              <a 
                href={repo.htmlUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-black/90 transition-colors"
              >
                View on GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 } 
  }
};

const itemVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 22 }
  }
};

const Repositories: React.FC<RepositoriesProps> = ({ repos, isLoading = false }) => {
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);

  const filtered = repos.filter(r => 
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.language?.toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="text-black font-bold">Repositories</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">Repositories</h1>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search repositories..." 
            className="pl-9 pr-4 py-2.5 border border-black/12 bg-white text-sm font-medium outline-none focus:border-black transition-colors w-full placeholder:text-muted-foreground/60"
          />
        </div>
      </motion.header>

      {/* Summary Bar */}
      {repos.length > 0 && (
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-5 text-xs text-muted-foreground font-medium">
          <span>{repos.length} repositories synced</span>
          {search && <span>· {filtered.length} matching "{search}"</span>}
        </motion.div>
      )}

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white border border-black/8">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-black/8 bg-zinc-50">
          <div className="col-span-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">Repository</div>
          <div className="col-span-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Language</div>
          <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Stars</div>
          <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Action</div>
        </div>

        <div className="divide-y divide-black/5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-8 h-8 bg-black/6 shrink-0 animate-pulse" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-40 bg-black/8 rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-black/5 rounded animate-pulse" />
                </div>
                <div className="hidden md:block h-3 w-16 bg-black/5 rounded animate-pulse" />
              </div>
            ))
          ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.length > 0 ? filtered.map((repo) => (
              <motion.div 
                key={repo.githubId ?? repo.id ?? repo.name}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col md:grid md:grid-cols-12 px-5 py-4 md:items-center hover:bg-black/[0.015] transition-colors gap-3 md:gap-0 group cursor-pointer"
              >
                {/* Name */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className="w-9 h-9 md:w-8 md:h-8 bg-black text-white flex items-center justify-center font-black text-sm md:text-xs shrink-0">
                    {repo.language?.charAt(0) || '-'}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <div className="text-sm font-bold uppercase tracking-tight truncate group-hover:translate-x-0.5 transition-transform">{repo.name}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate opacity-60">{repo.fullName}</div>
                  </div>
                </div>

                {/* Mobile stats row */}
                <div className="md:hidden flex items-center justify-between pt-2 border-t border-black/5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Language</p>
                    <p className="text-sm font-bold uppercase">{repo.language || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Stars</p>
                    <p className="text-sm font-bold">{repo.stargazersCount ?? 0}</p>
                  </div>
                  <motion.button 
                    onClick={(e) => { e.stopPropagation(); setSelectedRepo(repo); }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-widest"
                  >
                    Analyze
                  </motion.button>
                </div>

                {/* Desktop: Language */}
                <div className="hidden md:block md:col-span-3">
                  <span className="text-sm font-semibold">{repo.language || '—'}</span>
                  <div className="text-xs text-muted-foreground mt-0.5">{repo.forksCount ?? 0} forks</div>
                </div>

                {/* Desktop: Stars */}
                <div className="hidden md:block md:col-span-2">
                  <span className="text-sm font-bold">{repo.stargazersCount ?? 0}</span>
                </div>

                {/* Desktop: Actions */}
                <div className="hidden md:flex md:col-span-2 justify-end">
                  <motion.button 
                    onClick={(e) => { e.stopPropagation(); setSelectedRepo(repo); }}
                    whileHover={{ scale: 1.04, backgroundColor: '#000', color: '#fff' }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-1.5 border border-black/15 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Analyze
                  </motion.button>
                </div>
              </motion.div>
            )) : (
              <motion.div variants={itemVariants} className="py-20 text-center">
                <div className="w-12 h-12 bg-black/5 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-black/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <p className="text-base font-bold text-muted-foreground mb-1">
                  {search ? `No results for "${search}"` : 'No repositories synced'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {search ? 'Try a different search term' : 'Go to Overview and sync your GitHub account'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedRepo && (
          <RepositoryModal 
            repo={selectedRepo} 
            onClose={() => setSelectedRepo(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Repositories;
