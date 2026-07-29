import React from 'react';
import { AptGroup, SortField, SortOrder } from '../types';
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
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#a1a1aa]" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#ef4444]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#ef4444]" />
    );
  };

  // Helper to highlight matching query
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#ef4444]/30 text-[#f8fafc] px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-[#16161a] border border-[#2d1215] p-12 text-center my-6">
        <Shield className="w-12 h-12 text-[#52525b] mx-auto mb-3" />
        <h3 className="text-base font-mono font-bold text-[#e2e8f0]">No Threat Intel Records Found</h3>
        <p className="text-xs text-[#a1a1aa] mt-1 max-w-md mx-auto">
          No APT groups matched your active search query or filter criteria. Try resetting filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#16161a] border border-[#2d1215] shadow-2xl overflow-hidden my-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0c0c0e] border-b border-[#2d1215] text-[10px] font-mono text-[#a1a1aa] uppercase tracking-[0.15em] select-none">
              
              {/* MITRE Attack ID */}
              <th
                onClick={() => onSort('id')}
                className="py-3.5 px-4 font-semibold cursor-pointer group hover:text-[#f8fafc] transition-colors whitespace-nowrap min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>MITRE Attack ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>

              {/* APT / Classification */}
              <th
                onClick={() => onSort('classification')}
                className="py-3.5 px-4 font-semibold cursor-pointer group hover:text-[#f8fafc] transition-colors whitespace-nowrap min-w-[120px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>APT / Designation</span>
                  {renderSortIcon('classification')}
                </div>
              </th>

              {/* Major Aliases / Associated Groups */}
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap min-w-[220px]">
                Major Aliases / Associated Groups
              </th>

              {/* Sponsoring State Authority */}
              <th
                onClick={() => onSort('sponsoringAuthority')}
                className="py-3.5 px-4 font-semibold cursor-pointer group hover:text-[#f8fafc] transition-colors whitespace-nowrap min-w-[200px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Sponsoring State Authority</span>
                  {renderSortIcon('sponsoringAuthority')}
                </div>
              </th>

              {/* Front Company / Contractor Entity */}
              <th
                onClick={() => onSort('frontCompany')}
                className="py-3.5 px-4 font-semibold cursor-pointer group hover:text-[#f8fafc] transition-colors whitespace-nowrap min-w-[200px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Front Company / Contractor</span>
                  {renderSortIcon('frontCompany')}
                </div>
              </th>

              {/* Primary Targeted Sectors */}
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap min-w-[240px]">
                Primary Targeted Sectors
              </th>

              {/* Legal and Regulatory Actions */}
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap min-w-[240px]">
                Legal and Enforcement Actions
              </th>

              {/* Details Action */}
              <th className="py-3.5 px-3 text-center whitespace-nowrap w-[70px]">
                Inspect
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-[#2d1215] font-sans text-xs">
            {data.map((apt) => {
              const isPla = apt.sponsoringOrgType === 'PLA';
              const isMss = apt.sponsoringOrgType === 'MSS';

              return (
                <tr
                  key={apt.id}
                  onClick={() => onSelectApt(apt)}
                  className="hover:bg-[#251014]/60 transition-colors cursor-pointer group"
                >
                  
                  {/* MITRE ID */}
                  <td className="py-3.5 px-4 font-mono font-medium text-[#e2e8f0] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://attack.mitre.org/groups/${apt.id}/`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={`View ${apt.id} on MITRE ATT&CK website`}
                        className="px-2 py-1 bg-[#0c0c0e] border border-[#2d1215] text-[#f59e0b] hover:border-[#ef4444] hover:text-[#ef4444] flex items-center gap-1.5 transition-all text-xs"
                      >
                        <span>{highlightMatch(apt.id)}</span>
                        <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                      </a>
                    </div>
                  </td>

                  {/* APT Classification */}
                  <td className="py-3.5 px-4 font-serif font-semibold text-[#f8fafc] text-sm whitespace-nowrap">
                    <span className="px-2.5 py-0.5 bg-[#1a0a0c] border border-[#ef4444]/40 text-[#ef4444] inline-block font-sans text-xs font-semibold">
                      {highlightMatch(apt.classification)}
                    </span>
                  </td>

                  {/* Aliases */}
                  <td className="py-3.5 px-4 text-[#e2e8f0] max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {apt.aliases.map((alias, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#0c0c0e] border border-[#2d1215] text-[#a1a1aa] text-[11px] font-mono"
                        >
                          {highlightMatch(alias)}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Sponsoring State Authority */}
                  <td className="py-3.5 px-4 text-[#e2e8f0] font-medium max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 shrink-0 ${
                            isMss
                              ? 'bg-[#ef4444]'
                              : isPla
                              ? 'bg-[#f59e0b]'
                              : 'bg-[#71717a]'
                          }`}
                        />
                        <span className="text-[#f8fafc] font-mono text-[12px]">
                          {highlightMatch(apt.sponsoringAuthority)}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#a1a1aa] font-mono uppercase tracking-wider pl-3">
                        Org: {apt.sponsoringOrgType}
                      </div>
                    </div>
                  </td>

                  {/* Front Company / Contractor Entity */}
                  <td className="py-3.5 px-4 text-[#e2e8f0] max-w-xs font-mono text-[11px]">
                    <div className="bg-[#0c0c0e] p-2 border border-[#2d1215] text-[#a1a1aa]">
                      {highlightMatch(apt.frontCompany)}
                    </div>
                  </td>

                  {/* Primary Targeted Sectors */}
                  <td className="py-3.5 px-4 text-[#e2e8f0] max-w-xs">
                    <div className="text-[#e2e8f0] font-sans text-xs leading-relaxed mb-1.5">
                      {highlightMatch(apt.rawTargetedSectors)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {apt.targetedSectors.map((sector, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-1.5 py-0.5 bg-[#0c0c0e] text-[#f59e0b] border border-[#2d1215]"
                        >
                          {sector}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Legal and Regulatory Actions */}
                  <td className="py-3.5 px-4 text-[#e2e8f0] max-w-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 font-semibold uppercase tracking-wider shrink-0 mt-0.5 bg-[#1a0a0c] border border-[#ef4444]/40 text-[#ef4444]">
                        {apt.legalCategory}
                      </span>
                    </div>
                    <div className="text-[#a1a1aa] text-xs mt-1 leading-relaxed">
                      {highlightMatch(apt.legalActions)}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApt(apt);
                      }}
                      title="Inspect full intel dossier"
                      className="p-1.5 bg-[#0c0c0e] border border-[#2d1215] text-[#a1a1aa] hover:text-[#ef4444] hover:border-[#ef4444] transition-all"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer count banner */}
      <div className="bg-[#0c0c0e] border-t border-[#2d1215] px-4 py-3 flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
        <div>
          Showing <span className="text-[#f8fafc] font-bold">{data.length}</span> threat intelligence records
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          <span>Select any row for complete intelligence dossier</span>
        </div>
      </div>
    </div>
  );
};
