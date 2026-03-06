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
import InteractiveHero from './InteractiveHero';
import Documentation from './Documentation';

const LandingPage: React.FC = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 90,
        damping: 22
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-black/8"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <motion.div 
              className="w-6 h-6 bg-black text-white flex items-center justify-center font-black text-xs shrink-0"
            >
              D
            </motion.div>
            <span className="text-sm font-black tracking-tight uppercase">DevTrackr</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-bold text-muted-foreground">
              {['Features', 'AI Insights'].map((item) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '')}`}
                  whileHover={{ color: '#000' }}
                  className="transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                  >
                    Sign In
                  </motion.button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" className="text-xs font-black uppercase tracking-widest text-black border border-black px-5 py-2 hover:bg-black hover:text-white transition-all">Dashboard</Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="md:hidden p-2 -mr-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <motion.span animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-5 h-0.5 bg-black origin-center" />
              <motion.span animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} className="block w-5 h-0.5 bg-black" />
              <motion.span animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-5 h-0.5 bg-black origin-center" />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="md:hidden overflow-hidden bg-white border-t border-black/8"
            >
              <div className="px-5 py-5 flex flex-col gap-4">
                {['Features', 'AI Insights'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '')}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-black transition-colors py-1"
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-4 border-t border-black/8 flex items-center justify-between">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-sm font-black uppercase tracking-widest text-black">Sign In →</button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard" className="text-sm font-black uppercase tracking-widest text-black">Dashboard</Link>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-5 sm:px-8 max-w-6xl mx-auto pt-12 pb-16 md:pt-16 md:pb-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start text-center lg:text-left">

              <motion.h1 
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.88] uppercase mb-7"
              >
                Visualizing<br />
                Raw Talent.
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-base text-muted-foreground mb-10 leading-relaxed max-w-sm mx-auto lg:mx-0"
              >
                Transforming GitHub activity into high-contrast analytics. 
                Deterministic metrics for the precise engineer.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full justify-center lg:justify-start items-center lg:items-start">
                <SignedOut>
                  <SignInButton mode="modal">
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: '#111' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-7 py-3.5 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-black/90 transition-all w-full max-w-[240px] sm:w-auto"
                    >
                      Sync Profile →
                    </motion.button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" className="px-7 py-3.5 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-black/90 transition-all text-center w-full max-w-[240px] sm:w-auto">
                    Go to Dashboard →
                  </Link>
                </SignedIn>
                <Link 
                  to="/documentation"
                  className="px-7 py-3.5 border border-black/15 text-black font-bold uppercase text-xs tracking-widest transition-all inline-block w-full max-w-[240px] sm:w-auto text-center"
                >
                  Documentation
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Graphic */}
            <motion.div 
              variants={itemVariants}
              className="relative hidden lg:block"
            >
              <InteractiveHero />
            </motion.div>

          </div>
        </motion.section>

        {/* Stats Bar */}
        <section className="border-y border-black/8 bg-zinc-50">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-0">
              {[
                { label: 'Repositories Tracked', value: '10K+' },
                { label: 'Commits Analyzed', value: '2M+' },
                { label: 'Engineers Onboard', value: '500+' },
              ].map((stat, i) => (
                <React.Fragment key={stat.label}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">{stat.label}</div>
                  </motion.div>
                  {i < 2 && <div className="hidden sm:block w-px h-8 bg-black/10" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20 px-5 sm:px-8 max-w-6xl mx-auto scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-black/30 mb-3">Capabilities</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Core Infrastructure</h2>
            </div>
            <Link to="/documentation#features" className="text-[10px] font-black uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all shrink-0">
              Explore Feature engine →
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-3 border border-black/10">
            {[
              { id: '01', title: 'Privacy', head: 'Sovereignty', desc: 'Your code never touches our servers. We only ingest transient metadata, ensuring your intellectual property remains yours.' },
              { id: '02', title: 'Analytics', head: 'Productivity', desc: 'Deterministic scoring algorithms with zero fluff. Pure performance data and velocity metrics for serious engineers.' },
              { id: '03', title: 'Intelligence', head: 'Tech Stack', desc: 'Deep analysis of your technological footprint across ecosystems — language usage, framework distribution, and more.' }
            ].map((f, i) => (
              <motion.div 
                key={f.id}
                whileHover={{ backgroundColor: '#fafafa' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 md:p-10 group ${i < 2 ? 'border-b md:border-b-0 md:border-r border-black/10' : ''}`}
              >
                <span className="text-xs text-black/35 tracking-widest font-bold block mb-8 uppercase">{f.id}. {f.title}</span>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:translate-x-1 transition-transform">{f.head}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Insights Section */}
        <section id="aiinsights" className="py-16 md:py-20 px-5 sm:px-8 max-w-6xl mx-auto border-t border-black/8 scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-black/30 mb-3">Intelligence</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">AI Insights</h2>
            </div>
            <Link to="/documentation#ai" className="text-[10px] font-black uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all shrink-0">
              View AI Documentation →
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight">Deep Codebase <br className="hidden md:block" /> Analysis</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Our advanced AI engine processes your commit history, language distribution, and PR merge rates to generate personalized insights. Identify bottlenecks, discover your strongest technologies, and optimize your productivity.
              </p>
              <ul className="space-y-4">
                {[
                  'Automated pattern recognition',
                  'Actionable performance feedback',
                  'Tech stack proficiency scoring'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-black" />
                    <span className="text-sm font-bold uppercase tracking-widest">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-black text-white p-8 md:p-12 relative overflow-hidden"
            >
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-6">
                   <div className="w-2 h-2 bg-white rounded-full" />
                   <h4 className="text-xs font-black tracking-widest uppercase text-white">Live Insight Example</h4>
                 </div>
                 <p className="text-sm leading-relaxed text-white/85">
                   "Based on your recent activity, your productivity in TypeScript has increased by 40%. Consider mentoring junior developers in React patterns, as your PR merge rate is exceptionally high in this area."
                 </p>
               </div>
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                 className="absolute -bottom-10 -right-10 w-32 h-32 border-2 border-white/10 rounded-full pointer-events-none"
               />
            </motion.div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-16 md:py-20 px-5 sm:px-8 max-w-6xl mx-auto text-center border-t border-black/8">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4"
          >
            Get Started
          </motion.p>
          <motion.h2 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8"
          >
            Ready to Analyze?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed"
          >
            Connect your GitHub account and get instant insights into your development patterns.
          </motion.p>
          <SignedOut>
            <SignInButton mode="modal">
              <motion.button 
                whileHover={{ scale: 1.04, boxShadow: "0 16px 36px rgba(0,0,0,0.12)" }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-black text-white font-black uppercase text-xs tracking-widest transition-all"
              >
                Initialize Core Engine
              </motion.button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="inline-block px-10 py-4 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-black/90 transition-all">
              Access Dashboard
            </Link>
          </SignedIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/8 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          {/* Logo — left */}
          <Link to="/" className="flex items-center gap-2.5 justify-center md:justify-start hover:opacity-80 transition-opacity">
            <div className="w-5 h-5 bg-black text-white flex items-center justify-center font-black text-xs shrink-0">D</div>
            <span className="text-sm font-black tracking-tight uppercase">DevTrackr</span>
          </Link>
          {/* Tagline — center */}
          <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground text-center">
            All code remains yours.
          </p>
          {/* Links — right */}
          <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-bold justify-center md:justify-end">
            <a href="mailto:haldar.saumili843@gmail.com" className="text-muted-foreground hover:text-black transition-colors">Email</a>
            <a href="https://github.com/SaumiliHaldar" className="text-muted-foreground hover:text-black transition-colors">GitHub</a>
            <span className="text-black/25">© {new Date().getFullYear()}</span>
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
        <Route path="/documentation" element={<Documentation />} />
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
