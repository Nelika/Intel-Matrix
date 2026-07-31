import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AptGroup, SortField, SortOrder, getMitreUrl } from '../types';
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Shield, Copy, Check, Info } from 'lucide-react';

interface AptTableProps {
  data: AptGroup[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onSelectApt: (apt: AptGroup) => void;
  searchQuery: string;
}

export const AptTable: React.FC<AptTableProps> = ({
  data,
  sortField,
  sortOrder,
  onSort,
  onSelectApt,
  searchQuery,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  // Helper to highlight matching query
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 text-slate-900 px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 rounded-xl p-12 text-center my-6 shadow-xs"
      >
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-mono font-bold text-slate-800">No Threat Intel Records Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          No APT groups matched your active search query or filter criteria. Try resetting filters.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden my-6"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-[0.12em] select-none">
              
              {/* MITRE Attack ID */}
              <th
                onClick={() => onSort('id')}
                className="py-3.5 px-4 font-bold cursor-pointer group hover:text-slate-900 transition-colors whitespace-nowrap min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>MITRE Attack ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>

              {/* APT / Classification */}
              <th
                onClick={() => onSort('classification')}
                className="py-3.5 px-4 font-bold cursor-pointer group hover:text-slate-900 transition-colors whitespace-nowrap min-w-[120px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>APT / Classification</span>
                  {renderSortIcon('classification')}
                </div>
              </th>

              {/* Status & Lifecycle Window */}
              <th className="py-3.5 px-4 font-bold whitespace-nowrap min-w-[140px]">
                Activity Status
              </th>

              {/* Microsoft Taxonomy */}
              <th className="py-3.5 px-4 font-bold whitespace-nowrap min-w-[190px]">
                Microsoft Taxonomy
              </th>

              {/* Kaspersky / Securelist Tracking */}
              <th className="py-3.5 px-4 font-bold whitespace-nowrap min-w-[190px]">
                Kaspersky / Securelist Tracking
              </th>

              {/* Major Aliases / Associated Groups */}
              <th className="py-3.5 px-4 font-bold whitespace-nowrap min-w-[220px]">
                Major Aliases / Associated Groups
              </th>

              {/* Sponsoring State Authority */}
              <th
                onClick={() => onSort('sponsoringAuthority')}
                className="py-3.5 px-4 font-bold cursor-pointer group hover:text-slate-900 transition-colors whitespace-nowrap min-w-[200px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Sponsoring State Authority</span>
                  {renderSortIcon('sponsoringAuthority')}
                </div>
              </th>

              {/* Front Company / Contractor Entity */}
              <th
                onClick={() => onSort('frontCompany')}
                className="py-3.5 px-4 font-bold cursor-pointer group hover:text-slate-900 transition-colors whitespace-nowrap min-w-[200px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Front Company / Contractor</span>
                  {renderSortIcon('frontCompany')}
                </div>
              </th>

              {/* Primary Targeted Sectors */}
              <th className="py-3.5 px-4 font-bold whitespace-nowrap min-w-[240px]">
                Primary Targeted Sectors
              </th>

              {/* Legal and Regulatory Actions */}
              <th className="py-3.5 px-4 font-bold whitespace-nowrap min-w-[240px]">
                Legal and Enforcement Actions
              </th>

              {/* Details Action */}
              <th className="py-3.5 px-3 text-center whitespace-nowrap w-[70px]">
                Inspect
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-sans text-xs">
            <AnimatePresence mode="popLayout">
              {data.map((apt, idx) => {
                const isPla = apt.sponsoringOrgType === 'PLA';
                const isMss = apt.sponsoringOrgType === 'MSS';

                return (
                  <motion.tr
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.2) }}
                    onClick={() => onSelectApt(apt)}
                    className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                  >
                    
                    {/* MITRE ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={getMitreUrl(apt)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={`View ${apt.id} on MITRE ATT&CK website`}
                          className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400 flex items-center gap-1.5 transition-all text-xs font-semibold rounded"
                        >
                          <span>{highlightMatch(apt.id)}</span>
                          <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                        </a>
                      </div>
                    </td>

                    {/* APT Classification */}
                    <td className="py-3.5 px-4 font-serif font-bold text-slate-900 text-sm whitespace-nowrap">
                      <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 inline-block font-sans text-xs font-semibold rounded">
                        {highlightMatch(apt.classification)}
                      </span>
                    </td>

                    {/* Status & Lifecycle Window */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-full inline-flex items-center gap-1.5 ${
                          apt.currentStatus === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : apt.currentStatus === 'Intermittent'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            apt.currentStatus === 'Active'
                              ? 'bg-emerald-500 animate-ping'
                              : apt.currentStatus === 'Intermittent'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>{apt.currentStatus}</span>
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {apt.firstObservedYear}–{apt.lastObservedYear}
                      </div>
                    </td>

                    {/* Microsoft Taxonomy */}
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px] max-w-xs">
                      <span className="px-2 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded font-medium inline-block">
                        {highlightMatch(apt.microsoftTaxonomy)}
                      </span>
                    </td>

                    {/* Kaspersky / Securelist Tracking */}
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px] max-w-xs">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium inline-block">
                        {highlightMatch(apt.kasperskySecurelist)}
                      </span>
                    </td>

                    {/* Aliases */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {apt.aliases.map((alias, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono rounded"
                          >
                            {highlightMatch(alias)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Sponsoring State Authority */}
                    <td className="py-3.5 px-4 text-slate-800 font-medium max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isMss
                                ? 'bg-rose-500'
                                : isPla
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span className="text-slate-900 font-mono text-[12px] font-semibold">
                            {highlightMatch(apt.sponsoringAuthority)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider pl-3.5">
                          Org: {apt.sponsoringOrgType}
                        </div>
                      </div>
                    </td>

                    {/* Front Company / Contractor Entity */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs font-mono text-[11px]">
                      <div className="bg-slate-50 p-2 border border-slate-200 text-slate-700 rounded">
                        {highlightMatch(apt.frontCompany)}
                      </div>
                    </td>

                    {/* Primary Targeted Sectors */}
                    <td className="py-3.5 px-4 text-slate-800 max-w-xs">
                      <div className="text-slate-700 font-sans text-xs leading-relaxed mb-1.5">
                        {highlightMatch(apt.rawTargetedSectors)}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {apt.targetedSectors.map((sector, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Legal and Regulatory Actions */}
                    <td className="py-3.5 px-4 text-slate-800 max-w-xs">
                      <div className="flex items-start gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 font-semibold uppercase tracking-wider shrink-0 mt-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded">
                          {apt.legalCategory}
                        </span>
                      </div>
                      <div className="text-slate-600 text-xs mt-1 leading-relaxed">
                        {highlightMatch(apt.legalActions)}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3 text-center">
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApt(apt);
                        }}
                        title="Inspect full intel dossier"
                        className="p-1.5 bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded transition-all cursor-pointer"
                      >
                        <Info className="w-4 h-4" />
                      </motion.button>
                    </td>

                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {/* Footer count banner */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs font-mono text-slate-600">
        <div>
          Showing <span className="text-slate-900 font-bold">{data.length}</span> threat intelligence records
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Select any row for complete intelligence dossier</span>
        </div>
      </div>
    </motion.div>
  );
};

