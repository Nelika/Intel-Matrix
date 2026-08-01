import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Download, FileCode, Radio, Database, Cpu, Linkedin, Terminal, Check } from 'lucide-react';
import { AptGroup } from '../types';
import { exportFilteredDataToCSV, exportFilteredDataToJSON } from '../utils/exportUtils';

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  filteredData: AptGroup[];
  onOpenMitreModal?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  filteredCount,
  filteredData,
  onOpenMitreModal,
}) => {
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const handleExportCSV = () => {
    exportFilteredDataToCSV(filteredData);
    setExportFeedback(`Exported ${filteredData.length} records to CSV`);
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const handleExportJSON = () => {
    exportFilteredDataToJSON(filteredData);
    setExportFeedback(`Exported ${filteredData.length} records to JSON`);
    setTimeout(() => setExportFeedback(null), 3000);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative border-b border-cyan-900/60 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden"
    >
      {/* Techno Animated Cyber Background Grid */}
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '48px 48px'] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
        className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:24px_24px]"
      />

      {/* Sweeping Cyber Laser Beam Line */}
      <motion.div
        animate={{ y: ['-100%', '350%'] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent pointer-events-none"
      />

      {/* Glowing Ambient Radial Glows */}
      <motion.div
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="absolute -top-12 -left-12 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-12 right-12 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Status */}
          <div className="flex items-start gap-3.5">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mt-0.5 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </motion.div>

            <div>
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  CYBER INTEL MATRIX v3.8
                </span>

                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                  LIVE DATABASE
                </span>

                {/* Prominent "BY GOVIND NELIKA" Author Tag */}
                <a
                  href="https://www.linkedin.com/in/govind-nelika/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Connect on LinkedIn - Govind Nelika"
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-300 hover:text-amber-100 px-2.5 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/50 hover:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:shadow-[0_0_18px_rgba(245,158,11,0.5)] tracking-wider transition-all cursor-pointer group"
                >
                  <Cpu className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>BY GOVIND NELIKA</span>
                  <Linkedin className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-200 transition-colors ml-0.5" />
                </a>
              </div>

              {/* Main Heading */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                China APT Threat Intelligence Matrix 中华人民共和国
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans mt-1 leading-relaxed">
                Comprehensive mapping of state-sponsored Advanced Persistent Threat groups, front entities, targeted sectors, and regulatory actions.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 self-end md:self-auto">
            <motion.div
              layout
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/90 border border-cyan-800/50 text-xs font-mono text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <motion.span
                key={filteredCount}
                initial={{ scale: 1.2, color: '#22d3ee' }}
                animate={{ scale: 1, color: '#67e8f9' }}
                transition={{ duration: 0.3 }}
                className="font-semibold"
              >
                {filteredCount} / {totalCount} Records
              </motion.span>
            </motion.div>

            {onOpenMitreModal && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenMitreModal}
                title="Open MITRE ATT&CK Python SDK & Layer Exporter"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 hover:text-cyan-100 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">MITRE SDK</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportCSV}
              title="Export currently filtered matrix dataset to CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-cyan-700/60 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-medium transition-colors shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">CSV</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportJSON}
              title="Export currently filtered matrix dataset to JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-cyan-700/60 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-medium transition-colors shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">JSON</span>
            </motion.button>
          </div>

        </div>

        {/* Export Notification Toast Banner */}
        <AnimatePresence>
          {exportFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>{exportFeedback}</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-sans">Ready for offline analysis</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};


