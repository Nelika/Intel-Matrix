import React from 'react';
import { motion } from 'motion/react';
import { AptGroup } from '../types';
import { Shield, Landmark, Scale, Cpu } from 'lucide-react';

interface StatsOverviewProps {
  data: AptGroup[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const safeData = data || [];
  const total = safeData.length;

  const mssCount = safeData.filter((d) => d?.sponsoringOrgType === 'MSS').length;
  const plaCount = safeData.filter((d) => d?.sponsoringOrgType === 'PLA').length;
  const jointCount = safeData.filter((d) => d?.sponsoringOrgType === 'Defense / MSS' || d?.sponsoringOrgType === 'Joint / Independent').length;

  const indictmentCount = safeData.filter((d) => d?.legalCategory === 'Indictment' || d?.legalActions?.toLowerCase().includes('indictment')).length;
  const sanctionCount = safeData.filter((d) => d?.legalCategory === 'Sanctions' || d?.legalCategory === 'Asset Freeze' || d?.legalActions?.toLowerCase().includes('sanction')).length;

  // Aggregate top targeted sectors
  const sectorCounts: Record<string, number> = {};
  safeData.forEach((apt) => {
    (apt?.targetedSectors || []).forEach((sec) => {
      sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
    });
  });

  const sortedSectors = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
    >
      
      {/* Total APT Groups */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between relative group hover:border-blue-400 hover:shadow-md transition-shadow shadow-xs cursor-default"
      >
        <div>
          <div className="w-8 h-1 bg-blue-600 rounded-full mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            Tracked Threat Groups
          </p>
        </div>
        <div className="my-3">
          <motion.span
            key={total}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-serif text-slate-900 font-bold inline-block"
          >
            {total}
          </motion.span>
          <span className="text-sm font-serif italic text-blue-600 ml-2 font-normal">APTs</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Cataloged MITRE ATT&CK state-sponsored threat actors
        </p>
      </motion.div>

      {/* Primary State Sponsors */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between relative group hover:border-amber-400 hover:shadow-md transition-shadow shadow-xs cursor-default"
      >
        <div>
          <div className="w-8 h-1 bg-amber-500 rounded-full mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold flex items-center gap-1.5 font-mono">
            <Landmark className="w-3.5 h-3.5 text-amber-600" />
            Sponsoring State Split
          </p>
        </div>
        <div className="my-3 flex items-baseline gap-2 font-serif">
          <div>
            <span className="text-3xl font-bold text-slate-900">{mssCount}</span>
            <span className="text-xs text-rose-600 font-sans font-bold uppercase tracking-wider ml-1">MSS</span>
          </div>
          <span className="text-slate-300">/</span>
          <div>
            <span className="text-2xl font-bold text-slate-700">{plaCount}</span>
            <span className="text-xs text-amber-600 font-sans font-bold uppercase tracking-wider ml-1">PLA</span>
          </div>
          <span className="text-slate-300">/</span>
          <div>
            <span className="text-xl font-bold text-slate-500">{jointCount}</span>
            <span className="text-xs text-slate-500 font-sans uppercase tracking-wider ml-1">Joint</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Civilian Intelligence (MSS) vs Military PLA Units
        </p>
      </motion.div>

      {/* Enforcement & Indictments */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between relative group hover:border-indigo-400 hover:shadow-md transition-shadow shadow-xs cursor-default"
      >
        <div>
          <div className="w-8 h-1 bg-indigo-600 rounded-full mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold flex items-center gap-1.5 font-mono">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Legal Enforcement
          </p>
        </div>
        <div className="my-3 flex items-baseline gap-3 font-serif">
          <div>
            <span className="text-3xl font-bold text-slate-900">{indictmentCount}</span>
            <span className="text-xs text-rose-600 font-sans font-bold uppercase tracking-wider ml-1">DOJ</span>
          </div>
          <span className="text-slate-300">|</span>
          <div>
            <span className="text-2xl font-bold text-slate-700">{sanctionCount}</span>
            <span className="text-xs text-indigo-600 font-sans font-bold uppercase tracking-wider ml-1">OFAC</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Unsealed US DOJ indictments, Treasury & EU sanctions
        </p>
      </motion.div>

      {/* Top Targeted Sector Focus */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-blue-900 to-indigo-950 p-6 rounded-xl flex flex-col justify-between text-white shadow-md border border-blue-900 cursor-default"
      >
        <div>
          <div className="w-8 h-1 bg-sky-400 rounded-full mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-sky-200 flex items-center gap-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            Primary Target Sectors
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 my-3">
          {sortedSectors.map(([sector, count]) => (
            <motion.span
              key={sector}
              whileHover={{ scale: 1.08 }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white font-semibold backdrop-blur-xs cursor-pointer"
            >
              {sector} <span className="font-bold text-sky-300">({count})</span>
            </motion.span>
          ))}
        </div>
        <p className="text-xs font-medium text-slate-300 leading-relaxed">
          Highest frequency operational targets
        </p>
      </motion.div>

    </motion.div>
  );
};

