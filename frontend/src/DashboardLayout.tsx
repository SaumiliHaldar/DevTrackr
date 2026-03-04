import React, { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const sidebarVariants: Variants = {
    open: { 
      x: 0, 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40 
      } 
    },
    closed: { 
      x: "-100%", 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 40 
      } 
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        variants={sidebarVariants}
        animate={!isMobile ? "open" : (isSidebarOpen ? "open" : "closed")}
        className="w-60 border-r border-black/5 flex flex-col fixed h-[100dvh] bg-white z-50 md:sticky md:top-0 md:translate-x-0"
      >
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <motion.div whileHover={{ scale: 1.1 }} className="w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-[10px]">D</motion.div>
              <span className="text-sm font-black tracking-tight uppercase">DevTrackr</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Data Engine v1.0</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-[10px] font-black">✕</button>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <NavLink 
            to="/dashboard" 
            end
            onClick={() => setIsSidebarOpen(false)} 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${isActive ? 'bg-black text-white' : 'text-muted-foreground hover:bg-black/5'}`}
          >
            <motion.span whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 w-full">
              <span className="opacity-50">01.</span> Overview
            </motion.span>
          </NavLink>
          <NavLink 
            to="/dashboard/repositories" 
            onClick={() => setIsSidebarOpen(false)} 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${isActive ? 'bg-black text-white' : 'text-muted-foreground hover:bg-black/5'}`}
          >
            <motion.span whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 w-full">
              <span className="opacity-50">02.</span> Repositories
            </motion.span>
          </NavLink>
          <NavLink 
            to="/dashboard/analytics" 
            onClick={() => setIsSidebarOpen(false)} 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${isActive ? 'bg-black text-white' : 'text-muted-foreground hover:bg-black/5'}`}
          >
            <motion.span whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-3 w-full">
              <span className="opacity-50">03.</span> Analytics
            </motion.span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-bold truncate uppercase">{user?.fullName || 'User'}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">Pro Developer</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Toggle */}
      <div className="md:hidden p-4 border-b border-black/5 bg-white flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-[10px]">D</div>
          <span className="text-xs font-black uppercase tracking-tight">DevTrackr</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 space-y-1">
          <div className="w-5 h-0.5 bg-black"></div>
          <div className="w-5 h-0.5 bg-black"></div>
          <div className="w-5 h-0.5 bg-black"></div>
        </button>
      </div>

      <main className="flex-1 bg-[#fafafa] min-h-screen relative overflow-x-hidden">
        {children}
      </main>
      
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black/50 z-40"
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
