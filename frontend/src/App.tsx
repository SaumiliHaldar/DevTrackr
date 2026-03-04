import React, { useState } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useAuth
} from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './Dashboard';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-black/10">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-black/5"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-[10px] shrink-0"
            >
              D
            </motion.div>
            <span className="text-sm font-black tracking-tight uppercase">DevTrackr</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[9px] uppercase tracking-[0.2em] font-black text-muted-foreground">
            {['Features', 'Analytics', 'AI Insights'].map((item) => (
              <motion.a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '')}`}
                whileHover={{ y: -2, color: '#000' }}
                className="transition-colors"
              >
                {item}
              </motion.a>
            ))}
            
            <SignedOut>
              <SignInButton mode="modal">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition-all uppercase tracking-widest text-[9px] font-black"
                >
                  Login
                </motion.button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard" className="text-black hover:underline underline-offset-4 font-black">Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <motion.div animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-black mb-1"></motion.div>
            <motion.div animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-0.5 bg-black mb-1"></motion.div>
            <motion.div animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-black"></motion.div>
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white border-b border-black/5"
            >
              <div className="p-6 flex flex-col gap-6 text-[10px] uppercase tracking-widest font-black">
                <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
                <a href="#analytics" onClick={() => setIsMenuOpen(false)}>Analytics</a>
                <a href="#ai" onClick={() => setIsMenuOpen(false)}>AI Insights</a>
                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-black">Login</button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard" className="text-black">Dashboard</Link>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="pt-24 md:pt-32">
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-6 md:px-10 max-w-6xl mx-auto mb-20 md:mb-32"
        >
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div variants={itemVariants}>
              <div className="inline-block border border-black/10 px-3 py-1 text-[7px] md:text-[8px] uppercase tracking-[0.4em] font-black mb-8 md:mb-12 opacity-50">
                Data Aggregation v1.0
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tightest mb-6 md:mb-8 leading-[0.85] uppercase lg:-ml-1">
                Visualizing <br className="hidden md:block" />
                Raw Talent.
              </h1>
              <p className="max-w-sm text-muted-foreground text-[10px] md:text-sm mb-10 md:mb-12 leading-relaxed uppercase tracking-wider">
                Transforming GitHub activity into high-contrast analytics. 
                Deterministic metrics for the precise engineer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-8 py-4 bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black/90 transition-all text-center"
                    >
                      Sync Profile
                    </motion.button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black/90 transition-all text-center">
                    Go to Dashboard
                  </Link>
                </SignedIn>
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  className="w-full sm:w-auto px-8 py-4 border border-black/10 text-black font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                >
                  Documentation
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="relative hidden lg:block"
            >
              <div className="aspect-square border border-black/5 p-6 bg-[#fafafa]">
                 <div className="w-full h-full border border-black/10 flex flex-col bg-white overflow-hidden">
                  <div className="h-10 border-b border-black/10 px-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-black/10"></div>)}
                    </div>
                    <div className="text-[8px] font-black tracking-[0.3em] text-black/30 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full border border-black/20 animate-pulse"></span>
                       LIVE_STREAM
                    </div>
                  </div>
                  <div className="flex-1 p-6 grid grid-cols-12 gap-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1, duration: 1.5 }}
                      className="col-span-12 border border-black/5 h-20 p-4 flex flex-col justify-between"
                    >
                       <div className="w-8 h-1 bg-black/10"></div>
                       <div className="w-full h-1 bg-black/5"></div>
                       <div className="w-full h-1 bg-black/5"></div>
                    </motion.div>
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1.5, duration: 1 }}
                      className="col-span-8 border border-black/5 h-32 origin-bottom"
                    ></motion.div>
                    <motion.div 
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 1.8, duration: 1 }}
                      className="col-span-4 border border-black/5 h-32 origin-bottom"
                    ></motion.div>
                  </div>
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute -bottom-4 -left-4 w-24 h-24 border-b border-l border-black/10"
              ></motion.div>
            </motion.div>
          </div>
        </motion.section>

        <section id="features" className="py-20 md:py-24 px-6 md:px-10 max-w-6xl mx-auto border-t border-black/5">
          <div className="grid md:grid-cols-3 gap-0 border border-black/5">
            {[
              { id: '01', title: 'Features', head: 'Commit Sync', desc: 'Real-time ingestion of repository metadata. High fidelity tracking of every delta.' },
              { id: '02', title: 'Analytics', head: 'Productivity', desc: 'Deterministic scoring algorithms. No fluff, just performance data.' },
              { id: '03', title: 'Logic', head: 'Tech Stack', desc: 'Deep analysis of your technological footprint across various ecosystems.' }
            ].map((f, i) => (
              <motion.div 
                key={f.id}
                whileHover={{ backgroundColor: '#fafafa' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 md:p-10 border-black/5 group ${i < 2 ? 'border-b md:border-b-0 md:border-r' : ''}`}
              >
                <span className="text-[8px] text-black/30 tracking-[0.4em] font-black block mb-8 md:mb-10 uppercase">{f.id}. {f.title}</span>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:translate-x-1 transition-transform">{f.head}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest font-medium">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-20 md:py-32 px-6 md:px-10 max-w-6xl mx-auto text-center border-t border-black/5">
             <motion.h2 
               initial={{ scale: 0.9, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true }}
               className="text-3xl md:text-5xl font-black uppercase tracking-tightest mb-8"
             >
               Ready to Analyze?
             </motion.h2>
             <SignedOut>
                <SignInButton mode="modal">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-10 md:px-12 py-5 bg-black text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all"
                  >
                    Initialize Core Engine
                  </motion.button>
                </SignInButton>
             </SignedOut>
             <SignedIn>
                <Link to="/dashboard" className="w-full sm:w-auto px-10 md:px-12 py-5 bg-black text-white font-black uppercase text-[10px] tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-black/20 inline-block text-center">
                    Access Dashboard
                </Link>
             </SignedIn>
        </section>
      </main>

      <footer className="py-12 md:py-16 border-t border-black/5 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black"></div>
            <span className="text-xs font-black tracking-tighter uppercase">DevTrackr</span>
          </div>
          <div className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">
            All code remains yours.
          </div>
          <div className="flex gap-8 text-[9px] uppercase tracking-[0.2em] font-black">
            <a href="mailto:haldar.saumili843@gmail.com" className="hover:text-black transition-colors">Email</a>
            <a href="https://github.com/SaumiliHaldar" className="hover:text-black transition-colors">GitHub</a>
            <span className="text-black/20">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
          />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
