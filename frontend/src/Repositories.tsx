import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface RepositoriesProps {
  repos: any[];
}

const Repositories: React.FC<RepositoriesProps> = ({ repos }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
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
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none mb-2 text-primary">Repositories</h1>
          <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            <span>Workspace</span>
            <span className="opacity-30 font-normal">/</span>
            <span className="text-black">Repositories</span>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.input 
            variants={itemVariants}
            type="text" 
            placeholder="Search core..." 
            className="px-4 py-2.5 border border-black/5 bg-white text-[10px] uppercase font-bold tracking-widest outline-none focus:border-black transition-colors w-full md:w-64"
          />
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="bg-white border border-black/5">
        {/* Table Header - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-12 p-4 border-b border-black/5 text-[8px] uppercase font-black text-muted-foreground tracking-widest">
          <div className="col-span-6">Name</div>
          <div className="col-span-3">Language</div>
          <div className="col-span-3 text-right">Activity</div>
        </div>

        <div className="divide-y divide-black/5">
          <AnimatePresence mode="popLayout" initial={false}>
            {repos.length > 0 ? repos.map((repo) => (
              <motion.div 
                key={repo.id}
                variants={itemVariants}
                layout
                className="flex flex-col md:grid md:grid-cols-12 p-4 md:items-center hover:bg-black/[0.01] transition-colors gap-4 md:gap-0 group cursor-pointer"
              >
                {/* Name & ID */}
                <div className="md:col-span-6 flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 md:w-8 md:h-8 bg-black text-white md:bg-black/5 md:text-black flex items-center justify-center font-bold text-[11px] md:text-[10px] shrink-0"
                  >
                    {repo.language?.charAt(0) || '•'}
                  </motion.div>
                  <div className="overflow-hidden">
                    <div className="text-[12px] md:text-[11px] font-black uppercase tracking-tight truncate group-hover:translate-x-1 transition-transform">{repo.name}</div>
                    <div className="text-[9px] text-muted-foreground lowercase truncate opacity-60 font-mono tracking-tighter">{repo.fullName}</div>
                  </div>
                </div>

                {/* Mobile Meta (Visible only on mobile) */}
                <div className="md:hidden flex items-center justify-between border-t border-black/[0.03] pt-3 mt-1">
                   <div className="flex flex-col">
                      <span className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-1">Language</span>
                      <span className="text-[10px] font-black uppercase">{repo.language || 'Unknown'}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[8px] uppercase text-muted-foreground font-black tracking-widest mb-1">Stars</span>
                      <span className="text-[10px] font-black uppercase">{repo.stargazersCount}</span>
                   </div>
                </div>

                {/* Desktop Meta (Visible only on desktop) */}
                <div className="hidden md:block md:col-span-3">
                  <div className="text-[10px] font-bold uppercase">{repo.language || 'Unknown'}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-tighter">{repo.stargazersCount} Stars • {repo.forksCount || 0} Forks</div>
                </div>

                {/* Actions */}
                <div className="md:col-span-3 md:text-right">
                   <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full md:w-auto px-4 py-2 md:px-3 md:py-1 border border-black text-white bg-black md:border-black/10 md:bg-white md:text-black text-[9px] md:text-[8px] font-black uppercase hover:bg-black hover:text-white transition-all shadow-sm"
                   >
                     Analyze
                   </motion.button>
                </div>
              </motion.div>
            )) : (
              <motion.div variants={itemVariants} className="p-20 text-center text-muted-foreground text-[10px] uppercase tracking-[0.4em]">
                No repositories synced.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Repositories;
