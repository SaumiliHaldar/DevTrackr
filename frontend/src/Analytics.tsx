import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface AnalyticsProps {
  activityData: number[];
}

const Analytics: React.FC<AnalyticsProps> = ({ activityData }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  // Default to empty if no data
  const data = activityData.length > 0 ? activityData : new Array(30).fill(0);
  const maxCommits = Math.max(...data, 1);
  const yAxisTicks = [0, Math.ceil(maxCommits / 2), maxCommits];

  // Helper to get simple date labels
  const getXAxisLabels = () => {
    const labels = [];
    for (let i = 0; i <= 30; i += 10) {
      if (i === 0) labels.push({ pos: 0, label: '30D AGO' });
      else if (i === 10) labels.push({ pos: 10, label: '-20D', hideOnMobile: true });
      else if (i === 20) labels.push({ pos: 20, label: '-10D', hideOnMobile: true });
      else if (i === 30) labels.push({ pos: 30, label: 'TODAY' });
    }
    return labels;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full p-4 md:p-8"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none mb-2 text-primary">Analytics Engine</h1>
          <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            <span>Workspace</span>
            <span className="opacity-30 font-normal">/</span>
            <span className="text-black">Metric_Stream</span>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-9 bg-white border border-black/5 p-4 md:p-12 relative overflow-hidden group">
           {/* Background Grid Pattern */}
           <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none"></div>

           <div className="flex items-center justify-between mb-16 relative z-10 px-2 md:px-0">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-black"></div>
               <h2 className="text-[10px] uppercase font-black tracking-[0.4em]">Commits_Count</h2>
             </div>
             <div className="flex items-center gap-2 md:gap-4">
                <span className="hidden sm:inline text-[9px] text-muted-foreground uppercase font-black tracking-widest">Linear</span>
                <span className="text-[9px] text-black uppercase font-black bg-black/5 px-2 py-0.5">Live</span>
             </div>
           </div>
           
           <div className="relative h-64 md:h-96 flex items-end px-2 md:px-4">
             {/* Y-Axis Labels & Grid Lines */}
             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-4">
               {yAxisTicks.reverse().map((tick, i) => (
                 <div key={i} className="w-full flex items-center gap-4">
                   <span className="text-[8px] font-black text-muted-foreground w-6 text-right tabular-nums">{tick}</span>
                   <div className="flex-1 border-t border-black/[0.03]"></div>
                 </div>
               ))}
             </div>

             {/* Bar Chart */}
             <div className="flex-1 h-full flex items-end gap-1 md:gap-2 relative z-10">
                {data.map((count, i) => (
                  <motion.div 
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => setHoveredIndex(i)}
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${(count / maxCommits) * 100}%`,
                      backgroundColor: hoveredIndex === i ? '#000' : 'rgba(0,0,0,0.85)'
                    }}
                    transition={{ 
                      height: { delay: i * 0.005, duration: 1, ease: [0.16, 1, 0.3, 1] },
                      backgroundColor: { duration: 0.1 }
                    }}
                    className="flex-1 relative min-w-[1px] md:min-w-[2px] cursor-pointer"
                  >
                    <AnimatePresence>
                      {hoveredIndex === i && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-0.5 text-[7px] font-black uppercase whitespace-nowrap z-30 pointer-events-none"
                        >
                          {count}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
             </div>
           </div>

           {/* X-Axis Labels */}
           <div className="flex justify-between mt-8 text-[9px] uppercase font-black text-muted-foreground tracking-widest relative z-10 px-4 md:px-8">
              {getXAxisLabels().map((label, i) => (
                <div key={i} className={`flex flex-col items-center gap-2 ${label.hideOnMobile ? 'hidden md:flex' : 'flex'}`}>
                   <div className="w-[1px] h-2 bg-black/10"></div>
                   <span>{label.label}</span>
                </div>
              ))}
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-3 flex flex-col gap-6">
           <motion.div variants={itemVariants} className="bg-white border border-black/5 p-6 md:p-8 relative overflow-hidden">
             <h2 className="text-[10px] uppercase font-black tracking-[0.4em] mb-8 md:mb-10 text-muted-foreground">Aggregated_Scores</h2>
             <div className="grid grid-cols-2 md:grid-cols-1 gap-8">
               {[
                 { label: 'Efficiency', value: '94', unit: '%' },
                 { label: 'Reliability', value: '8.2', unit: '' },
                 { label: 'Impact', value: 'High', unit: '' }
               ].map((m) => (
                 <div key={m.label} className="group cursor-default">
                    <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-[0.2em] block mb-2 transition-colors group-hover:text-black">{m.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-black tracking-tightest uppercase">{m.value}</span>
                      <span className="text-[10px] font-black opacity-30">{m.unit}</span>
                    </div>
                 </div>
               ))}
             </div>
           </motion.div>

           <motion.div 
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-black text-white p-6 md:p-8 overflow-hidden relative group cursor-pointer"
           >
             <div className="relative z-10">
                <h3 className="text-lg font-black tracking-tightest uppercase mb-3">Intelligence_Report</h3>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={data.reduce((a, b) => a + b, 0)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] uppercase tracking-widest opacity-60 leading-relaxed max-w-[200px]"
                  >
                    {data.reduce((a, b) => a + b, 0) > 0 
                      ? "Live delta streams detected. Neural analysis suggests optimal efficiency levels."
                      : "No recent activity detected. Connect repository core to begin deep scan."}
                  </motion.p>
                </AnimatePresence>
             </div>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
               className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rotate-12"
             ></motion.div>
           </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
