import React, { useState, useMemo } from 'react';
import { APT_GROUPS, ALL_SECTORS, ALL_SPONSORS } from './data/aptData';
import { AptGroup, FilterState, SortField, SortOrder } from './types';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { FilterToolbar } from './components/FilterToolbar';
import { AptTable } from './components/AptTable';
import { AptCardGrid } from './components/AptCardGrid';
import { AptTimeline } from './components/AptTimeline';
import { AptActivityGraph } from './components/AptActivityGraph';
import { AptDetailModal } from './components/AptDetailModal';
import { SectorDistributionChart } from './components/SectorDistributionChart';
import { ShieldCheck, BarChart2, Eye, EyeOff, Lock, ExternalLink } from 'lucide-react';

export default function App() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    sponsoringOrgType: '',
    selectedSector: '',
    legalCategory: '',
  });

  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedApt, setSelectedApt] = useState<AptGroup | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'timeline' | 'graph'>('table');
  const [showCharts, setShowCharts] = useState<boolean>(true);

  // Update filter helper
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      sponsoringOrgType: '',
      selectedSector: '',
      legalCategory: '',
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.sponsoringOrgType) count++;
    if (filters.selectedSector) count++;
    if (filters.legalCategory) count++;
    return count;
  }, [filters]);

  // Filtered and Sorted APT Groups
  const filteredData = useMemo(() => {
    return APT_GROUPS.filter((apt) => {
      // Query search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesId = apt.id.toLowerCase().includes(query);
        const matchesClass = apt.classification.toLowerCase().includes(query);
        const matchesMsft = apt.microsoftTaxonomy.toLowerCase().includes(query);
        const matchesKaspersky = apt.kasperskySecurelist.toLowerCase().includes(query);
        const matchesAlias = apt.aliases.some((a) => a.toLowerCase().includes(query));
        const matchesSponsor = apt.sponsoringAuthority.toLowerCase().includes(query);
        const matchesFront = apt.frontCompany.toLowerCase().includes(query);
        const matchesSectors = apt.rawTargetedSectors.toLowerCase().includes(query);
        const matchesLegal = apt.legalActions.toLowerCase().includes(query);

        if (
          !matchesId &&
          !matchesClass &&
          !matchesMsft &&
          !matchesKaspersky &&
          !matchesAlias &&
          !matchesSponsor &&
          !matchesFront &&
          !matchesSectors &&
          !matchesLegal
        ) {
          return false;
        }
      }

      // Sponsor Org Filter
      if (filters.sponsoringOrgType && apt.sponsoringOrgType !== filters.sponsoringOrgType) {
        return false;
      }

      // Sector Filter
      if (filters.selectedSector) {
        const hasSector = apt.targetedSectors.some(
          (s) => s.toLowerCase() === filters.selectedSector.toLowerCase()
        );
        if (!hasSector) return false;
      }

      // Legal Category Filter
      if (filters.legalCategory && apt.legalCategory !== filters.legalCategory) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filters, sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Background Grid Accent */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-70 pointer-events-none" />

      {/* Main Header */}
      <Header
        totalCount={APT_GROUPS.length}
        filteredCount={filteredData.length}
        filteredData={filteredData}
      />

      {/* Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* KPI Stats Overview */}
        <StatsOverview data={filteredData} />

        {/* Analytics Chart Toggle */}
        <div className="flex items-center justify-between mb-5 bg-white p-3.5 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-800">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span className="font-bold uppercase tracking-[0.12em] text-[11px] text-blue-700">Target Analytics & Sector Exposure Index</span>
          </div>

          <button
            onClick={() => setShowCharts((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition-colors border border-slate-200 rounded hover:border-blue-300"
          >
            {showCharts ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Hide Analytics</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Show Analytics</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Analytics Charts */}
        {showCharts && (
          <SectorDistributionChart
            data={filteredData}
            onSelectSector={(sec) => handleFilterChange({ selectedSector: sec })}
            selectedSector={filters.selectedSector}
          />
        )}

        {/* Search & Filter Toolbar */}
        <FilterToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          allSectors={ALL_SECTORS}
          allSponsors={ALL_SPONSORS}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeFilterCount={activeFilterCount}
        />

        {/* Main Data Display */}
        {viewMode === 'table' ? (
          <AptTable
            data={filteredData}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onSelectApt={(apt) => setSelectedApt(apt)}
            searchQuery={filters.searchQuery}
          />
        ) : viewMode === 'grid' ? (
          <AptCardGrid
            data={filteredData}
            onSelectApt={(apt) => setSelectedApt(apt)}
            searchQuery={filters.searchQuery}
          />
        ) : viewMode === 'timeline' ? (
          <AptTimeline
            data={filteredData}
            onSelectApt={(apt) => setSelectedApt(apt)}
            searchQuery={filters.searchQuery}
          />
        ) : (
          <AptActivityGraph
            data={filteredData}
            onSelectApt={(apt) => setSelectedApt(apt)}
            searchQuery={filters.searchQuery}
          />
        )}

        {/* Footer info */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 font-mono flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Cyber Threat Intelligence Matrix &bull; MITRE ATT&CK Mapped</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a
              href="https://attack.mitre.org/groups/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <span>MITRE ATT&CK Groups</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.cisa.gov/cybersecurity-advisories"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <span>CISA Advisories</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.justice.gov/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <span>US DOJ Cyber Releases</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>

      </main>

      {/* Detail Modal */}
      <AptDetailModal apt={selectedApt} onClose={() => setSelectedApt(null)} />

    </div>
  );
}
