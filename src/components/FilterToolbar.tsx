import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X, LayoutGrid, Table, RefreshCw, Clock, Activity, Terminal, Share2, ArrowLeftRight } from 'lucide-react';
import { FilterState } from '../types';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  allSectors: string[];
  allSponsors: string[];
  viewMode: 'table' | 'grid' | 'timeline' | 'graph' | 'network' | 'mitre' | 'compare';
  onViewModeChange: (mode: 'table' | 'grid' | 'timeline' | 'graph' | 'network' | 'mitre' | 'compare') => void;
  activeFilterCount: number;
  onOpenCommandPalette?: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  allSectors,
  allSponsors,
  viewMode,
  onViewModeChange,
  activeFilterCount,
  onOpenCommandPalette,
}) => {
  const modes = [
    { id: 'table', label: 'Matrix Table', icon: Table },
    { id: 'grid', label: 'Card Grid', icon: LayoutGrid },
    { id: 'compare', label: 'Compare Groups', icon: ArrowLeftRight },
    { id: 'timeline', label: 'Legal Timeline', icon: Clock },
    { id: 'graph', label: 'Activity Graph', icon: Activity },
    { id: 'network', label: 'Network Graph', icon: Share2 },
    { id: 'mitre', label: 'MITRE ATT&CK SDK', icon: Terminal },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200 p-4 mb-6 shadow-xs rounded-xl space-y-4"
    >
      
      {/* Top Search & Layout Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search APT name, MITRE ID (e.g. G0006), aliases, front company, sector..."
            className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white font-mono rounded-lg transition-all"
          />
          <AnimatePresence>
            {filters.searchQuery ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            ) : (
              onOpenCommandPalette && (
                <button
                  onClick={onOpenCommandPalette}
                  title="Open Command Palette (Ctrl+K)"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-200/80 hover:bg-slate-300 hover:text-slate-700 px-1.5 py-0.5 rounded border border-slate-300 transition-colors cursor-pointer"
                >
                  <kbd className="font-sans">⌘</kbd>
                  <span>K</span>
                </button>
              )
            )}
          </AnimatePresence>
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-mono rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                <span>Reset Filters ({activeFilterCount})</span>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 gap-1 rounded-lg relative">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => onViewModeChange(mode.id)}
                  className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                    isActive ? 'text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="hidden sm:inline relative z-10">{mode.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="viewModeActiveTab"
                      className="absolute inset-0 bg-blue-600 rounded shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
        
        {/* Sponsoring Authority Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.sponsoringOrgType}
            onChange={(e) => onFilterChange({ sponsoringOrgType: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer transition-colors hover:border-slate-300"
          >
            <option value="">All State Authorities</option>
            {allSponsors.map((sponsor) => (
              <option key={sponsor} value={sponsor}>
                {sponsor}
              </option>
            ))}
          </select>
        </div>

        {/* Targeted Sector Selector */}
        <div>
          <select
            value={filters.selectedSector}
            onChange={(e) => onFilterChange({ selectedSector: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer transition-colors hover:border-slate-300"
          >
            <option value="">All Targeted Sectors</option>
            {allSectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        {/* Legal Action Category Filter */}
        <div>
          <select
            value={filters.legalCategory}
            onChange={(e) => onFilterChange({ legalCategory: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer transition-colors hover:border-slate-300"
          >
            <option value="">All Enforcement Actions</option>
            <option value="Indictment">DOJ Indictments</option>
            <option value="Sanctions">Sanctions & OFAC</option>
            <option value="Asset Freeze">EU / UK Asset Freezes</option>
            <option value="Advisory">Security Advisories & Bulletins</option>
            <option value="Exposure Report">Public Exposure Reports</option>
          </select>
        </div>

      </div>

    </motion.div>
  );
};

