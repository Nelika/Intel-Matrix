import React from 'react';
import { Search, Filter, X, LayoutGrid, Table, RefreshCw } from 'lucide-react';
import { FilterState } from '../types';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  allSectors: string[];
  allSponsors: string[];
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
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
    <div className="bg-[#16161a] border border-[#2d1215] p-4 mb-6 shadow-xl space-y-4">
      
      {/* Top Search & Layout Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search APT name, MITRE ID (e.g. G0006), aliases, front company, sector..."
            className="w-full pl-9 pr-8 py-2 bg-[#0c0c0e] border border-[#2d1215] text-xs text-[#f8fafc] placeholder-[#71717a] focus:outline-none focus:border-[#ef4444] font-mono transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#f8fafc]"
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
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0c0c0e] border border-[#ef4444]/60 text-[#ef4444] hover:bg-[#ef4444]/10 text-xs font-mono transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}

          <div className="flex items-center bg-[#0c0c0e] border border-[#2d1215] p-1 gap-1">
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-all ${
                viewMode === 'table'
                  ? 'bg-[#dc2626] text-[#f8fafc] font-bold shadow-sm'
                  : 'text-[#a1a1aa] hover:text-[#f8fafc]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Matrix Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#dc2626] text-[#f8fafc] font-bold shadow-sm'
                  : 'text-[#a1a1aa] hover:text-[#f8fafc]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Card Grid</span>
            </button>
          </div>

        </div>

      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#2d1215]">
        
        {/* Sponsoring Authority Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#a1a1aa] shrink-0" />
          <select
            value={filters.sponsoringOrgType}
            onChange={(e) => onFilterChange({ sponsoringOrgType: e.target.value })}
            className="w-full bg-[#0c0c0e] border border-[#2d1215] py-1.5 px-3 text-xs text-[#e2e8f0] font-mono focus:outline-none focus:border-[#ef4444] cursor-pointer"
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
            className="w-full bg-[#0c0c0e] border border-[#2d1215] py-1.5 px-3 text-xs text-[#e2e8f0] font-mono focus:outline-none focus:border-[#ef4444] cursor-pointer"
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
            className="w-full bg-[#0c0c0e] border border-[#2d1215] py-1.5 px-3 text-xs text-[#e2e8f0] font-mono focus:outline-none focus:border-[#ef4444] cursor-pointer"
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
