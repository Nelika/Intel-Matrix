import React from 'react';
import { Search, Filter, X, LayoutGrid, Table, RefreshCw, Clock, Activity } from 'lucide-react';
import { FilterState } from '../types';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  allSectors: string[];
  allSponsors: string[];
  viewMode: 'table' | 'grid' | 'timeline' | 'graph';
  onViewModeChange: (mode: 'table' | 'grid' | 'timeline' | 'graph') => void;
  activeFilterCount: number;
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
}) => {
  return (
    <div className="bg-white border border-slate-200 p-4 mb-6 shadow-sm rounded-xl space-y-4">
      
      {/* Top Search & Layout Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search APT name, MITRE ID (e.g. G0006), aliases, front company, sector..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono rounded-lg transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-mono rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 gap-1 rounded-lg">
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Matrix Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Card Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-all ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Legal Timeline</span>
            </button>
            <button
              onClick={() => onViewModeChange('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded transition-all ${
                viewMode === 'graph'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Activity Graph</span>
            </button>
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
            className="w-full bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer"
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
            className="w-full bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer"
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
            className="w-full bg-slate-50 border border-slate-200 py-1.5 px-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 rounded-lg cursor-pointer"
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

    </div>
  );
};
