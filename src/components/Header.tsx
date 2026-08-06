import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Download, 
  FileCode, 
  Radio, 
  Database, 
  Cpu, 
  Linkedin, 
  Terminal, 
  Check,
  Menu,
  X,
  Flame,
  BarChart2,
  Share2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  Compass,
  Info,
  Printer,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { AptGroup } from '../types';
import { exportFilteredDataToCSV, exportFilteredDataToJSON } from '../utils/exportUtils';

export type SectionId = 'cisa' | 'heatmap' | 'sector' | 'network' | 'dataset';

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  filteredData: AptGroup[];
  onOpenMitreModal?: () => void;
  onOpenBriefingModal?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsModal?: () => void;
  onOpenAboutPage?: () => void;
  onNavigateToSection?: (sectionId: SectionId) => void;
  sectionStatus?: {
    cisaFeed?: boolean;
    threatHeatmap?: boolean;
    sectorIndex?: boolean;
    networkWidget?: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  filteredCount,
  filteredData,
  onOpenMitreModal,
  onOpenBriefingModal,
  onOpenAboutPage,
  onNavigateToSection,
  sectionStatus,
}) => {
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isManualCollapsed, setIsManualCollapsed] = useState<boolean | null>(null);

  // Hysteresis scroll listener with passive scroll & debounced threshold to prevent jitter/flicker
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Smooth hysteresis threshold: collapse at > 120px down, expand at < 30px up
          if (currentY > 120) {
            setIsScrolled(true);
          } else if (currentY < 30) {
            setIsScrolled(false);
            setIsManualCollapsed(null);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCompact = isManualCollapsed !== null ? isManualCollapsed : isScrolled;

  // Keyboard shortcut listener for ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

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

  const handleMenuNavigate = (sectionId: SectionId) => {
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    } else {
      // Fallback direct scroll if callback is not passed
      const targetId = 
        sectionId === 'cisa' ? 'cisa-ics-feed-section' :
        sectionId === 'heatmap' ? 'threat-heatmap-section' :
        sectionId === 'sector' ? 'targeted-sector-exposure-section' :
        sectionId === 'network' ? 'network-topology-section' :
        'apt-china-dataset-section';
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-cyan-900/60 bg-slate-950/95 backdrop-blur-md text-slate-100 shadow-2xl"
    >
      {/* Techno Background Effects (Contained in overflow-hidden layer) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Techno Animated Cyber Background Grid */}
        <motion.div
          animate={{ backgroundPosition: ['0px 0px', '48px 48px'] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:24px_24px]"
        />

        {/* Sweeping Cyber Laser Beam Line */}
        <motion.div
          animate={{ y: ['-100%', '350%'] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"
        />

        {/* Glowing Ambient Radial Glows */}
        <motion.div
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute -top-12 -left-12 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-12 right-12 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-3">
          
          {/* Title & Status Block */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <motion.div
              whileHover={{ rotate: 3, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              onClick={onOpenAboutPage}
              title="Cicada 3301 Threat Intelligence - Click for About Us"
              className={`rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer group flex items-center justify-center transition-all duration-300 ${
                isCompact ? 'p-1.5' : 'p-2.5 mt-0.5'
              }`}
            >
              <ShieldAlert className={`text-cyan-400 group-hover:scale-110 transition-all duration-300 animate-pulse ${
                isCompact ? 'w-4 h-4' : 'w-6 h-6'
              }`} />
            </motion.div>

            <div className="min-w-0 flex-1">
              {/* Badges Row (Smoothly collapsible) */}
              <AnimatePresence initial={false}>
                {!isCompact && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginBottom: 6 }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden flex flex-wrap items-center gap-2"
                  >
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                      CICADA 3301 INTEL v3.8
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Heading */}
              <h1 className={`font-mono font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] flex items-center gap-2 flex-wrap transition-all duration-300 ${
                isCompact ? 'text-xs sm:text-sm leading-tight' : 'text-lg sm:text-xl md:text-2xl'
              }`}>
                <span className="truncate">China APT Threat Intelligence Matrix</span>
                <span className={`text-slate-400 transition-all duration-300 ${isCompact ? 'text-[10px] hidden sm:inline' : 'text-sm'}`}>
                  中华人民共和国
                </span>
              </h1>

              {/* Description (Smoothly collapsible) */}
              <AnimatePresence initial={false}>
                {!isCompact && (
                  <motion.p
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 4 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden text-xs text-slate-300 max-w-2xl font-sans leading-relaxed"
                  >
                    Comprehensive mapping of state-sponsored Advanced Persistent Threat groups, front entities, targeted sectors, regulatory actions, and real-time CISA ICS advisory intelligence.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Secondary Buttons (Visible in Expanded Mode) */}
            <AnimatePresence initial={false}>
              {!isCompact && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:flex items-center gap-2"
                >
                  {onOpenBriefingModal && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onOpenBriefingModal}
                      title="Generate Formatted Briefing PDF"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 hover:text-emerald-100 text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Briefing PDF</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Database / Records Badge (Always visible on desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-cyan-800/50 text-xs font-mono text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <motion.span
                key={filteredCount}
                initial={{ scale: 1.2, color: '#22d3ee' }}
                animate={{ scale: 1, color: '#67e8f9' }}
                transition={{ duration: 0.3 }}
                className="font-semibold"
              >
                {filteredCount} / {totalCount}
              </motion.span>
            </div>

            {/* About Us Button (Always accessible) */}
            {onOpenAboutPage && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenAboutPage}
                title="Open About Us & Organization Information Page"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-500/60 hover:border-cyan-300 text-cyan-200 hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_14px_rgba(6,182,212,0.25)] cursor-pointer group"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">About</span>
              </motion.button>
            )}

            {/* Techno Slide Menu Trigger Button (Always accessible) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(true)}
              title="Open Cyber Threat Intelligence Slide Navigation Menu"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 border border-cyan-400/80 hover:border-cyan-300 text-cyan-200 hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_18px_rgba(6,182,212,0.35)] cursor-pointer group"
            >
              <Menu className="w-4 h-4 text-cyan-300 group-hover:rotate-90 transition-transform duration-300" />
              <span>Menu</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </motion.button>

            {/* Interactive Header Expand/Collapse Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsManualCollapsed(isCompact ? false : true)}
              title={isCompact ? "Expand Header" : "Collapse Header"}
              aria-label={isCompact ? "Expand Header" : "Collapse Header"}
              className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center group ${
                isCompact
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/80 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[0_0_14px_rgba(6,182,212,0.35)]'
                  : 'bg-slate-900/90 hover:bg-slate-800 border border-cyan-800/60 hover:border-cyan-500/80 text-cyan-300 hover:text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]'
              }`}
            >
              {isCompact ? (
                <ChevronDown className="w-4 h-4 text-cyan-300 group-hover:translate-y-0.5 transition-transform" />
              ) : (
                <ChevronUp className="w-4 h-4 text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
              )}
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

      {/* Techno Slide Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] cursor-pointer"
            />

            {/* Slide Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 h-screen w-full max-w-md bg-slate-950 border-l border-cyan-500/50 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.3)] z-[100] flex flex-col font-mono overflow-hidden"
            >
              {/* Animated Background Grid */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Drawer Header */}
              <div className="relative z-10 px-5 py-4 border-b border-cyan-900/80 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    <Compass className="w-5 h-5 animate-spin-slow" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>SYSTEM NAVIGATION</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                        v3.8
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Direct Intel Matrix Modules &amp; Live Streams
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 border border-slate-700 hover:border-red-600 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Close navigation menu (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Line */}
              <div className="relative z-10 px-5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                  <span>5 MODULES ONLINE</span>
                </span>
                <span className="text-[10px] text-slate-500">Press ESC to exit</span>
              </div>

              {/* Menu Items Content */}
              <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3">
                
                {/* Item 0: About Us & Organization Overview */}
                {onOpenAboutPage && (
                  <motion.div
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onOpenAboutPage();
                      setIsMenuOpen(false);
                    }}
                    className="group p-3.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/50 hover:border-cyan-300 transition-all cursor-pointer shadow-md flex items-start gap-3.5"
                  >
                    <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 shrink-0 group-hover:scale-110 transition-transform">
                      <Info className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider group-hover:text-white flex items-center gap-1.5">
                          <span>About Us &amp; Mission</span>
                          <span className="text-[9px] font-mono text-cyan-400 font-normal">(Cicada 3301)</span>
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-cyan-950 text-cyan-300 border-cyan-700 font-mono">
                          PAGE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-snug">
                        Organization overview, threat intelligence mission statement, research methodology, and contact info.
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-all self-center shrink-0" />
                  </motion.div>
                )}

                {/* Item 1: CISA ICS Feed */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuNavigate('cisa')}
                  className="group p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-red-500/70 transition-all cursor-pointer shadow-md flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-400 shrink-0 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-red-300 uppercase tracking-wider group-hover:text-red-200">
                        CISA ICS Feed
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        sectionStatus?.cisaFeed
                          ? 'bg-red-950 text-red-300 border-red-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {sectionStatus?.cisaFeed ? 'ACTIVE' : 'BROWSE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-snug">
                      Live CISA ICS Advisory Stream XML feed &amp; 30-day incoming vulnerability trend line chart.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all self-center shrink-0" />
                </motion.div>

                {/* Item 2: Threat Heatmap */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuNavigate('heatmap')}
                  className="group p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/70 transition-all cursor-pointer shadow-md flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-lg bg-orange-950/80 border border-orange-800 text-orange-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Flame className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-orange-300 uppercase tracking-wider group-hover:text-orange-200">
                        Threat Heatmap
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        sectionStatus?.threatHeatmap
                          ? 'bg-orange-950 text-orange-300 border-orange-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {sectionStatus?.threatHeatmap ? 'ACTIVE' : 'EXPAND'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-snug">
                      Industry Sector Exposure Grid mapping risk severity levels across critical infrastructure.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all self-center shrink-0" />
                </motion.div>

                {/* Item 3: Targeted Sector Exposure Index */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuNavigate('sector')}
                  className="group p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/70 transition-all cursor-pointer shadow-md flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-300 uppercase tracking-wider group-hover:text-blue-200">
                        Targeted Sector Exposure Index
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        sectionStatus?.sectorIndex
                          ? 'bg-blue-950 text-blue-300 border-blue-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {sectionStatus?.sectorIndex ? 'ACTIVE' : 'COLLAPSED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-snug">
                      Visual analytics charts showing targeted industry sector distributions &amp; state sponsor org breakdown.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all self-center shrink-0" />
                </motion.div>

                {/* Item 4: Threat Network Topology & Relational Map */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuNavigate('network')}
                  className="group p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/70 transition-all cursor-pointer shadow-md flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Share2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider group-hover:text-cyan-200">
                        Threat Network Topology &amp; Relational Map
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        sectionStatus?.networkWidget
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {sectionStatus?.networkWidget ? 'ACTIVE' : 'COLLAPSED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-snug">
                      Relational graph mapping APT group linkages, front organizations, legal actions, and targeted sectors.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all self-center shrink-0" />
                </motion.div>

                {/* Item 5: APT China (PRC) Dataset */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMenuNavigate('dataset')}
                  className="group p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/70 transition-all cursor-pointer shadow-md flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Database className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider group-hover:text-emerald-200">
                        APT China (PRC) Dataset
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-emerald-950 text-emerald-300 border-emerald-700 font-mono">
                        {filteredCount} ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-snug">
                      Primary Threat Actor Matrix, intelligence repository &amp; multi-faceted search filters.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all self-center shrink-0" />
                </motion.div>

              </div>

              {/* Drawer Footer */}
              <div className="relative z-10 p-4 border-t border-cyan-900/80 bg-slate-900/90 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Loaded: <strong className="text-cyan-300">{filteredCount}</strong> / {totalCount} APTs</span>
                  </span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">CYBER MATRIX INTEL</span>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};


