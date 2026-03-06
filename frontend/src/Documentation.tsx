import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">System Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            DevTrackr is a high-fidelity development analytics engine designed to transform raw GitHub metadata into actionable productivity insights. 
            By connecting directly to your repository history, our system extracts deterministic metrics that represent your true technical velocity and technological footprint.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="p-6 border border-black/10 bg-zinc-50">
              <h3 className="font-black uppercase text-sm mb-2">Philosophy</h3>
              <p className="text-xs text-muted-foreground">Zero fluff, high contrast metrics. We believe in visualizing talent through precision and data-driven evidence.</p>
            </div>
            <div className="p-6 border border-black/10 bg-zinc-50">
              <h3 className="font-black uppercase text-sm mb-2">Methodology</h3>
              <p className="text-xs text-muted-foreground">Deterministic algorithms analyze every delta, commit, and PR to build a comprehensive map of and for the engineer.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Core Features',
      content: (
        <div className="space-y-8">
          <h2 className="text-3xl font-black uppercase tracking-tight">Functional Capabilities</h2>
          
          <div className="space-y-6">
            <div className="border-l-2 border-black pl-6 py-2">
              <h3 className="font-black uppercase text-lg mb-2">Commit Ingestion & Sync</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our real-time ingestion engine monitors your GitHub activity with millisecond precision. Every push, pull request, and code delta is captured and processed through our metadata analysis pipeline.
              </p>
            </div>

            <div className="border-l-2 border-black pl-6 py-2">
              <h3 className="font-black uppercase text-lg mb-2">Productivity Scoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Move beyond simple line counts. Our scoring algorithm evaluates velocity, complexity, and impact. We look at merge rates, PR turnaround times, and consistent activity patterns to derive a "DevScore" that actually reflects output.
              </p>
            </div>

            <div className="border-l-2 border-black pl-6 py-2">
              <h3 className="font-black uppercase text-lg mb-2">Linguistic Footprint</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Understand your technological distribution across ecosystems. We provide a deep breakdown of language usage, framework implementation, and tool proficiency based on your actual repository content.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      title: 'AI Intelligence',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">The Insight Engine</h2>
          <p className="text-muted-foreground leading-relaxed">
            The DevTrackr AI engine goes beyond raw data. It interprets patterns and provides human-readable feedback on your development lifecycle.
          </p>
          <div className="bg-black text-white p-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Engine Capabilities</h3>
            <ul className="space-y-3">
              {[
                'Automated bottleneck identification in PR workflows',
                'Actionable performance feedback loops',
                'Technology stack proficiency scoring',
                'Predictive velocity modeling'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-white shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">Trust & Transparency</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your code is your intellectual property. DevTrackr operates on a "Transparency First" model.
          </p>
          <div className="space-y-4">
            <div className="p-6 border border-black/10">
              <h3 className="font-black uppercase text-sm mb-2">Data Sovereignty</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All code analysis is performed without storing your actual source code. We ingest metadata—commit messages, file change counts, language types—and derive insights from those markers. Your logic remains yours.
              </p>
            </div>
            <div className="p-6 border border-black/10">
              <h3 className="font-black uppercase text-sm mb-2">Zero-Persistence Metadata</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We do not share your development patterns with third parties. Your analytics are private to your profile and serve only to enhance your individual or team productivity.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-black text-xs shrink-0">D</div>
            <span className="text-sm font-black tracking-tight uppercase">DevTrackr</span>
          </Link>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[250px_1fr] gap-16">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block space-y-2 sticky top-32 h-fit">
            <p className="text-[10px] uppercase tracking-widest font-black text-black/30 mb-6">Documentation</p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === section.id 
                    ? 'bg-black text-white' 
                    : 'text-black/50 hover:text-black hover:bg-black/5'
                }`}
              >
                {section.title}
              </button>
            ))}
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 scrollbar-hide mb-8 border-b border-black/5">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`whitespace-nowrap px-6 py-3 text-[10px] font-black uppercase tracking-widest border border-black ${
                  activeTab === section.id ? 'bg-black text-white' : 'bg-transparent text-black'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <section className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {sections.find(s => s.id === activeTab)?.content}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/8 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
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

export default Documentation;
