import React, { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'Overview', num: '01', end: true },
  { to: '/dashboard/repositories', label: 'Repositories', num: '02', end: false },
  { to: '/dashboard/analytics', label: 'Analytics', num: '03', end: false },
];

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

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  const sidebarVariants: Variants = {
    open: { 
      x: 0, 
      transition: { type: "spring", stiffness: 350, damping: 38 }
    },
    closed: { 
      x: "-100%", 
      transition: { type: "spring", stiffness: 350, damping: 38 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        variants={sidebarVariants}
        animate={!isMobile ? "open" : (isSidebarOpen ? "open" : "closed")}
        className="w-64 border-r border-black/8 flex flex-col fixed h-[100dvh] bg-white z-50 md:sticky md:top-0 md:translate-x-0 shrink-0"
      >
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-black/8 flex items-center justify-between">
          <NavLink to="/" className="flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-black text-white flex items-center justify-center font-black text-xs shrink-0">D</div>
              <span className="text-sm font-black tracking-tight uppercase">DevTrackr</span>
            </div>
          </NavLink>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1.5 text-muted-foreground hover:text-black transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          
          {NAV_LINKS.map((link) => (
            <NavLink 
              key={link.to}
              to={link.to} 
              end={link.end}
              onClick={() => setIsSidebarOpen(false)} 
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-all rounded-none group ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'text-muted-foreground hover:bg-black/5 hover:text-black'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xs font-black ${isActive ? 'opacity-50 text-white' : 'opacity-30'}`}>{link.num}</span>
                  <span className="uppercase tracking-wide">{link.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="ml-auto w-1 h-1 bg-white rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-black/8">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-bold truncate">{user?.fullName || 'User'}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Developer</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-black/8 px-4 h-14 flex items-center justify-between shrink-0">
        <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-5 h-5 bg-black text-white flex items-center justify-center font-black text-xs">D</div>
          <span className="text-sm font-black uppercase tracking-tight">DevTrackr</span>
        </NavLink>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 -mr-1"
          aria-label="Open sidebar"
        >
          <div className="flex flex-col gap-1">
            <div className="w-5 h-0.5 bg-black" />
            <div className="w-5 h-0.5 bg-black" />
            <div className="w-3.5 h-0.5 bg-black" />
          </div>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-zinc-50 min-h-screen overflow-x-hidden">
        {children}
      </main>
      
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
