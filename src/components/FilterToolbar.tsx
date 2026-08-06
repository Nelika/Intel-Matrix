import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  X,
  LayoutGrid,
  Table,
  RefreshCw,
  Clock,
  Activity,
  Terminal,
  Share2,
  ArrowLeftRight,
  Download,
  FileCode,
  FileText,
  ChevronDown,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { AptGroup, FilterState } from '../types';
import {
  exportFilteredDataToCSV,
  exportFilteredDataToJSON,
  exportFilteredDataToMarkdown,
} from '../utils/exportUtils';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  allSectors: string[];
  allSponsors: string[];
  viewMode: 'table' | 'grid' | 'timeline' | 'graph' | 'network' | 'mitre' | 'compare' | 'cisa';
  onViewModeChange: (mode: 'table' | 'grid' | 'timeline' | 'graph' | 'network' | 'mitre' | 'compare' | 'cisa') => void;
  activeFilterCount: number;
  onOpenCommandPalette?: () => void;
  filteredData?: AptGroup[];
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
  filteredData = [],
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setExportNotice(msg);
    setIsExportOpen(false);
    setTimeout(() => setExportNotice(null), 3000);
  };

  const modes = [
    { id: 'table', label: 'Matrix Table', icon: Table },
    { id: 'grid', label: 'Card Grid', icon: LayoutGrid },
    { id: 'compare', label: 'Compare Groups', icon: ArrowLeftRight },
    { id: 'timeline', label: 'Legal Timeline', icon: Clock },
    { id: 'graph', label: 'Activity Graph', icon: Activity },
    { id: 'network', label: 'Network Graph', icon: Share2 },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-slate-900/90 border border-slate-800/90 p-3.5 sm:p-4 rounded-xl shadow-inner space-y-4 max-w-full overflow-hidden"
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
            className="w-full pl-10 pr-16 py-2 bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono rounded-lg transition-all"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            ) : (
              onOpenCommandPalette && (
                <button
                  onClick={onOpenCommandPalette}
                  title="Open Command Palette (Ctrl+K)"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  <kbd className="font-sans">⌘</kbd>
                  <span>K</span>
                </button>
              )
            )}
          </AnimatePresence>
        </div>

        {/* View Mode, Export & Reset Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Direct Export as CSV Button */}
          <button
            id="export-as-csv-btn"
            onClick={() => {
              exportFilteredDataToCSV(filteredData);
              triggerNotice(`Downloaded CSV (${filteredData.length} records)`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-xs font-mono font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            title="Export currently filtered dataset as CSV for offline reporting"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export as CSV</span>
          </button>

          {/* Export Filtered Data Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/80 text-xs font-mono font-bold rounded-lg transition-all shadow-xs cursor-pointer"
              title="Export options for all formats"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>All Formats</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isExportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-56 bg-slate-950 border border-cyan-800/80 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-mono space-y-1"
                >
                  <div className="px-2.5 py-1 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-800">
                    Export Filtered Records ({filteredData.length})
                  </div>

                  <button
                    onClick={() => {
                      exportFilteredDataToCSV(filteredData);
                      triggerNotice(`Downloaded CSV (${filteredData.length} records)`);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-slate-200 hover:text-cyan-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export to CSV</span>
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">.csv</span>
                  </button>

                  <button
                    onClick={() => {
                      exportFilteredDataToJSON(filteredData, filters);
                      triggerNotice(`Downloaded JSON (${filteredData.length} records)`);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-slate-200 hover:text-cyan-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export to JSON</span>
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">.json</span>
                  </button>

                  <button
                    onClick={() => {
                      exportFilteredDataToMarkdown(filteredData, filters);
                      triggerNotice(`Downloaded Markdown Report (${filteredData.length} records)`);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-slate-200 hover:text-cyan-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      <span>Export Markdown Report</span>
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">.md</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-mono rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse text-rose-400" />
                <span>Reset Filters ({activeFilterCount})</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* View Mode Tabs - 2 rows of 3 buttons */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl relative w-full sm:w-auto min-w-[300px]">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => onViewModeChange(mode.id)}
                  className={`relative z-10 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer w-full min-h-[34px] ${
                    isActive ? 'text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 relative z-10 shrink-0" />
                  <span className="relative z-10 text-[11px] font-semibold tracking-tight whitespace-nowrap">{mode.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="viewModeActiveTab"
                      className="absolute inset-0 bg-cyan-400 rounded-lg shadow-sm"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
        
        {/* Sponsoring Authority Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.sponsoringOrgType}
            onChange={(e) => onFilterChange({ sponsoringOrgType: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 rounded-lg cursor-pointer transition-colors hover:border-slate-700"
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
            className="w-full bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 rounded-lg cursor-pointer transition-colors hover:border-slate-700"
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
            className="w-full bg-slate-950 border border-slate-800 py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 rounded-lg cursor-pointer transition-colors hover:border-slate-700"
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

      {/* Export Notice Toast Banner */}
      <AnimatePresence>
        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 overflow-hidden"
          >
            <div className="py-2 px-3 bg-emerald-900 border border-emerald-600 text-emerald-100 rounded-lg text-xs font-mono flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                <span className="font-bold">{exportNotice}</span>
              </div>
              <span className="text-[10px] text-emerald-200">Export Complete</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

