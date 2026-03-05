import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface RepositoriesProps {
  repos: any[];
  isLoading?: boolean;
}

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
        <div className="relative self-start sm:self-auto sm:w-64">
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
    </motion.div>
  );
};

export default Repositories;
