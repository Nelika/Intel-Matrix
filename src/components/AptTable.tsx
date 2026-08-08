import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AptGroup, SortField, SortOrder, getMitreUrl } from '../types';
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Shield, Copy, Check, Info, Printer, ShieldAlert, Flame, AlertTriangle, TrendingUp } from 'lucide-react';
import { getAccumulatedCisaAdvisories, getAdvisoriesForApt, getEffectiveAptStatus, getAptAlertInfo } from '../utils/cisaUtils';
import { CisaSparkline } from './CisaSparkline';

interface AptTableProps {
  data: AptGroup[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onSelectApt: (apt: AptGroup) => void;
  onOpenBriefingModal?: (apt: AptGroup) => void;
  searchQuery: string;
  isCompact?: boolean;
}

export const AptTable: React.FC<AptTableProps> = ({
  data,
  sortField,
  sortOrder,
  onSort,
  onSelectApt,
  onOpenBriefingModal,
  searchQuery,
  isCompact = false,
}) => {
  // Pre-calculate associated CISA advisories map for all APT groups
  const cisaAdvisoriesMap = useMemo(() => {
    const allAdvisories = getAccumulatedCisaAdvisories();
    const map = new Map<string, ReturnType<typeof getAdvisoriesForApt>>();
    data.forEach((apt) => {
      map.set(apt.id, getAdvisoriesForApt(apt, allAdvisories));
    });
    return map;
  }, [data]);
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

  const thClass = isCompact
    ? 'py-2 px-2.5 font-bold cursor-pointer group hover:text-slate-900 transition-colors whitespace-nowrap min-w-[100px]'
    : 'py-3 px-3 sm:py-3.5 sm:px-4 font-bold cursor-pointer group hover:text-slate-900 transition-colors whitespace-nowrap min-w-[110px]';

  const thStaticClass = isCompact
    ? 'py-2 px-2.5 font-bold whitespace-nowrap'
    : 'py-3 px-3 sm:py-3.5 sm:px-4 font-bold whitespace-nowrap';

  const tdClass = isCompact
    ? 'py-1.5 px-2.5 text-xs'
    : 'py-3.5 px-4 text-xs';

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
      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden max-w-full my-4 sm:my-6"
    >
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-[0.12em] select-none">
              
              {/* MITRE Attack ID */}
              <th
                onClick={() => onSort('id')}
                className={thClass}
              >
                <div className="flex items-center gap-1.5">
                  <span>MITRE ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>

              {/* APT / Classification */}
              <th
                onClick={() => onSort('classification')}
                className={thClass}
              >
                <div className="flex items-center gap-1.5">
                  <span>APT Group</span>
                  {renderSortIcon('classification')}
                </div>
              </th>

              {/* Status & Lifecycle Window */}
              <th className={`${thStaticClass} min-w-[120px]`}>
                Activity Status
              </th>

              {/* 12-Month CISA Advisories Sparkline */}
              <th className={`${thStaticClass} min-w-[120px]`}>
                <div className="flex items-center gap-1.5" title="Frequency of CISA ICS advisories linked to this APT over the last 12 months">
                  <TrendingUp className="w-3 h-3 text-red-500" />
                  <span>CISA Trend (12M)</span>
                </div>
              </th>

              {/* Alert Status Column */}
              <th
                onClick={() => onSort('alert')}
                className={`${thClass} min-w-[140px]`}
              >
                <div className="flex items-center gap-1.5" title="Newly detected high-risk activity based on the latest CISA advisories">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>Alert</span>
                  {renderSortIcon('alert')}
                </div>
              </th>

              {/* Microsoft Taxonomy */}
              <th className={`${thStaticClass} min-w-[140px]`}>
                Microsoft Taxonomy
              </th>

              {/* Kaspersky / Securelist Tracking */}
              <th className={`${thStaticClass} min-w-[140px]`}>
                Kaspersky Tracking
              </th>

              {/* Major Aliases / Associated Groups */}
              <th className={`${thStaticClass} min-w-[150px]`}>
                Major Aliases
              </th>

              {/* Sponsoring State Authority */}
              <th
                onClick={() => onSort('sponsoringAuthority')}
                className={`${thClass} min-w-[150px]`}
              >
                <div className="flex items-center gap-1.5">
                  <span>State Sponsor</span>
                  {renderSortIcon('sponsoringAuthority')}
                </div>
              </th>

              {/* Front Company / Contractor Entity */}
              <th
                onClick={() => onSort('frontCompany')}
                className={`${thClass} min-w-[150px]`}
              >
                <div className="flex items-center gap-1.5">
                  <span>Front Company</span>
                  {renderSortIcon('frontCompany')}
                </div>
              </th>

              {/* Primary Targeted Sectors */}
              <th className={`${thStaticClass} min-w-[170px]`}>
                Targeted Sectors
              </th>

              {/* Legal and Regulatory Actions */}
              <th className={`${thStaticClass} min-w-[170px]`}>
                Legal Actions
              </th>

              {/* Details Action */}
              <th className={`${isCompact ? 'py-2 px-1.5' : 'py-3 px-2 sm:py-3.5 sm:px-3'} text-center whitespace-nowrap w-[60px]`}>
                Inspect
              </th>

            </tr>
          </thead>

              <tbody className="divide-y divide-slate-100 font-sans text-xs">
            <AnimatePresence mode="popLayout">
              {data.map((apt) => {
                const isPla = apt.sponsoringOrgType === 'PLA';
                const isMss = apt.sponsoringOrgType === 'MSS';
                const cisaAdvisories = cisaAdvisoriesMap.get(apt.id) || [];
                const effectiveStatus = getEffectiveAptStatus(apt, cisaAdvisories);
                const alertInfo = getAptAlertInfo(apt, cisaAdvisories);
                const isHighPriority = cisaAdvisories.length > 0;

                return (
                  <motion.tr
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                    whileHover={{
                      backgroundColor: 'rgba(239, 246, 255, 0.95)',
                      x: 3,
                      transition: { duration: 0.15, ease: 'easeOut' },
                    }}
                    transition={{
                      layout: { type: 'spring', stiffness: 350, damping: 30 },
                      opacity: { duration: 0.2 },
                      y: { duration: 0.15 },
                    }}
                    onClick={() => onSelectApt(apt)}
                    className={`hover:bg-blue-50/90 transition-all cursor-pointer group border-l-2 relative z-0 hover:z-10 ${
                      isHighPriority
                        ? 'border-l-red-500 bg-red-50/10 hover:border-l-red-600'
                        : 'border-l-transparent hover:border-l-blue-600'
                    }`}
                  >
                    
                    {/* MITRE ID */}
                    <td className={`${tdClass} font-mono font-medium text-slate-800 whitespace-nowrap`}>
                      <div className="flex items-center gap-2">
                        <a
                          href={getMitreUrl(apt)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={`View ${apt.id} on MITRE ATT&CK website`}
                          className={`${isCompact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'} bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400 flex items-center gap-1.5 transition-all font-semibold rounded`}
                        >
                          <span>{highlightMatch(apt.id)}</span>
                          <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                        </a>
                      </div>
                    </td>

                    {/* APT Classification */}
                    <td className={`${tdClass} font-serif font-bold text-slate-900 whitespace-nowrap`}>
                      <div className="flex flex-col items-start gap-1">
                        <span className={`${isCompact ? 'px-2 py-0 text-[11px]' : 'px-2.5 py-0.5 text-xs'} bg-rose-50 border border-rose-200 text-rose-700 inline-block font-sans font-semibold rounded`}>
                          {highlightMatch(apt.classification)}
                        </span>
                        {isHighPriority && (
                          <span
                            title={`Active CISA ICS Threat: Associated with ${cisaAdvisories.length} CISA advisory (${cisaAdvisories.map((a) => a.advisoryId).join(', ')})`}
                            className={`inline-flex items-center gap-1 font-mono font-extrabold rounded-full border shadow-xs ${
                              isCompact ? 'px-1.5 py-0 text-[9px]' : 'px-2 py-0.5 text-[10px]'
                            } bg-red-950 text-red-300 border-red-500/70 shadow-red-900/30`}
                          >
                            <ShieldAlert className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-red-400 shrink-0 animate-pulse`} />
                            <span>HIGH-PRIORITY</span>
                            <span className="bg-red-500 text-white rounded-full px-1.5 py-0 text-[9px] font-mono font-extrabold leading-none">
                              {cisaAdvisories.length}
                            </span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status & Lifecycle Window */}
                    <td className={`${tdClass} whitespace-nowrap`}>
                      <div className="flex flex-col items-start gap-0.5">
                        <span
                          className={`${isCompact ? 'px-2 py-0 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'} font-mono font-bold rounded-full inline-flex items-center gap-1.5 ${
                            effectiveStatus.status === 'Active'
                              ? effectiveStatus.isUpgradedByCisa
                                ? 'bg-gradient-to-r from-red-100 to-emerald-100 text-red-900 border border-red-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : effectiveStatus.status === 'Intermittent'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              effectiveStatus.status === 'Active'
                                ? 'bg-emerald-500 animate-ping'
                                : effectiveStatus.status === 'Intermittent'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{effectiveStatus.statusLabel}</span>
                        </span>
                        <div className="text-[10px] font-mono text-slate-400">
                          {apt.firstObservedYear}–{effectiveStatus.lastObservedYear}
                        </div>
                        {isHighPriority && (
                          <div
                            title={`${cisaAdvisories.length} Active CISA ICS Advisories linked`}
                            className="mt-0.5 flex items-center gap-1 text-[9px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded"
                          >
                            <Flame className="w-2.5 h-2.5 text-red-500 animate-pulse shrink-0" />
                            <span>ICS Threat Active</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 12-Month CISA Advisories Sparkline Cell */}
                    <td className={`${tdClass} whitespace-nowrap`}>
                      <CisaSparkline advisories={cisaAdvisories} compact={isCompact} />
                    </td>

                    {/* Alert Status Cell */}
                    <td className={`${tdClass} whitespace-nowrap`}>
                      {alertInfo.alertLevel !== 'NONE' ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <span
                            title={`${alertInfo.summary} — ${alertInfo.latestAdvisoryTitle || ''}`}
                            className={`inline-flex items-center gap-1 font-mono font-extrabold rounded-full border shadow-2xs ${
                              isCompact ? 'px-2 py-0 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
                            } ${alertInfo.badgeBg} ${alertInfo.badgeText} ${alertInfo.badgeBorder}`}
                          >
                            {alertInfo.pulse ? (
                              <ShieldAlert className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-red-400 shrink-0 animate-pulse`} />
                            ) : (
                              <AlertTriangle className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-amber-600 shrink-0`} />
                            )}
                            <span>{alertInfo.label}</span>
                            {alertInfo.advisoryCount > 0 && (
                              <span className="bg-red-500 text-white rounded-full px-1.5 py-0 text-[9px] font-mono font-extrabold leading-none">
                                {alertInfo.advisoryCount}
                              </span>
                            )}
                          </span>

                          <div className="text-[10px] font-mono text-slate-500 max-w-[150px] truncate" title={alertInfo.summary}>
                            {alertInfo.latestAdvisoryId ? (
                              <span className="flex items-center gap-1">
                                <span className="text-red-700 font-bold">{alertInfo.latestAdvisoryId}</span>
                                {alertInfo.daysAgo !== undefined && (
                                  <span className="text-slate-400 text-[9px]">
                                    ({alertInfo.daysAgo === 0 ? 'today' : `${alertInfo.daysAgo}d ago`})
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span>{alertInfo.summary}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span className="text-slate-400 text-[10px]">CLEAR</span>
                        </div>
                      )}
                    </td>

                    {/* Microsoft Taxonomy */}
                    <td className={`${tdClass} text-slate-700 font-mono text-[11px] max-w-xs`}>
                      <span className="px-2 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded font-medium inline-block">
                        {highlightMatch(apt.microsoftTaxonomy)}
                      </span>
                    </td>

                    {/* Kaspersky / Securelist Tracking */}
                    <td className={`${tdClass} text-slate-700 font-mono text-[11px] max-w-xs`}>
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium inline-block">
                        {highlightMatch(apt.kasperskySecurelist)}
                      </span>
                    </td>

                    {/* Aliases */}
                    <td className={`${tdClass} text-slate-700 max-w-xs`}>
                      <div className="flex flex-wrap gap-1">
                        {apt.aliases.map((alias, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 ${isCompact ? 'text-[10px]' : 'text-[11px]'} font-mono rounded`}
                          >
                            {highlightMatch(alias)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Sponsoring State Authority */}
                    <td className={`${tdClass} text-slate-800 font-medium max-w-xs`}>
                      <div className="space-y-0.5">
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
                          <span className="text-slate-900 font-mono text-[11px] sm:text-[12px] font-semibold">
                            {highlightMatch(apt.sponsoringAuthority)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider pl-3.5">
                          Org: {apt.sponsoringOrgType}
                        </div>
                      </div>
                    </td>

                    {/* Front Company / Contractor Entity */}
                    <td className={`${tdClass} text-slate-700 max-w-xs font-mono text-[11px]`}>
                      <div className={`bg-slate-50 ${isCompact ? 'p-1' : 'p-2'} border border-slate-200 text-slate-700 rounded`}>
                        {highlightMatch(apt.frontCompany)}
                      </div>
                    </td>

                    {/* Primary Targeted Sectors */}
                    <td className={`${tdClass} text-slate-800 max-w-xs`}>
                      <div className={`text-slate-700 font-sans ${isCompact ? 'text-[11px] mb-1' : 'text-xs mb-1.5'} leading-tight`}>
                        {highlightMatch(apt.rawTargetedSectors)}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {apt.targetedSectors.map((sector, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded"
                          >
                            {sector}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Legal and Regulatory Actions */}
                    <td className={`${tdClass} text-slate-800 max-w-xs`}>
                      <div className="flex items-start gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 font-semibold uppercase tracking-wider shrink-0 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded">
                          {apt.legalCategory}
                        </span>
                      </div>
                      <div className={`text-slate-600 ${isCompact ? 'text-[11px] mt-0.5' : 'text-xs mt-1'} leading-tight`}>
                        {highlightMatch(apt.legalActions)}
                      </div>
                    </td>

                    {/* Action */}
                    <td className={`${isCompact ? 'py-1.5 px-2' : 'py-3.5 px-3'} text-center`}>
                      <div className="flex items-center justify-center gap-1">
                        {onOpenBriefingModal && (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBriefingModal(apt);
                            }}
                            title="Generate Briefing PDF"
                            className={`${isCompact ? 'p-1' : 'p-1.5'} bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 rounded transition-all cursor-pointer`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApt(apt);
                          }}
                          title="Inspect full intel dossier"
                          className={`${isCompact ? 'p-1' : 'p-1.5'} bg-slate-100 border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded transition-all cursor-pointer`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
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

