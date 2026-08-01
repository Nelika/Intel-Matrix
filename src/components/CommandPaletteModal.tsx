import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Command,
  Table,
  LayoutGrid,
  Clock,
  Activity,
  Share2,
  Terminal,
  Filter,
  RefreshCw,
  X,
  Keyboard,
  Shield,
  ArrowRight,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { AptGroup, FilterState } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AptGroup[];
  viewMode: 'table' | 'grid' | 'timeline' | 'graph' | 'network' | 'mitre' | 'compare';
  onViewModeChange: (mode: 'table' | 'grid' | 'timeline' | 'graph' | 'network' | 'mitre' | 'compare') => void;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectApt: (apt: AptGroup) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  data,
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectApt,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Actions list
  const viewActions = [
    { id: 'view-table', type: 'view', mode: 'table', label: 'Switch to Matrix Table View', icon: Table, shortcut: '1' },
    { id: 'view-grid', type: 'view', mode: 'grid', label: 'Switch to Card Grid View', icon: LayoutGrid, shortcut: '2' },
    { id: 'view-compare', type: 'view', mode: 'compare', label: 'Switch to Side-by-Side Comparison View', icon: ArrowLeftRight, shortcut: 'C' },
    { id: 'view-timeline', type: 'view', mode: 'timeline', label: 'Switch to Legal Timeline View', icon: Clock, shortcut: '3' },
    { id: 'view-graph', type: 'view', mode: 'graph', label: 'Switch to Activity Graph View', icon: Activity, shortcut: '4' },
    { id: 'view-network', type: 'view', mode: 'network', label: 'Switch to Network Topology View', icon: Share2, shortcut: '5' },
    { id: 'view-mitre', type: 'view', mode: 'mitre', label: 'Switch to MITRE ATT&CK SDK View', icon: Terminal, shortcut: '6' },
  ] as const;

  const sponsorFilterActions = [
    { id: 'sponsor-all', type: 'sponsor', value: '', label: 'Filter: All State Authorities', shortcut: '' },
    { id: 'sponsor-mss', type: 'sponsor', value: 'MSS', label: 'Filter: MSS (State Security)', shortcut: '' },
    { id: 'sponsor-pla', type: 'sponsor', value: 'PLA', label: 'Filter: PLA (Military Cyber)', shortcut: '' },
    { id: 'sponsor-mps', type: 'sponsor', value: 'MPS', label: 'Filter: MPS (Public Security)', shortcut: '' },
  ];

  // Matching APT Groups based on query
  const matchingApts = query.trim()
    ? data
        .filter(
          (apt) =>
            apt.classification.toLowerCase().includes(query.toLowerCase()) ||
            apt.id.toLowerCase().includes(query.toLowerCase()) ||
            apt.aliases.some((a) => a.toLowerCase().includes(query.toLowerCase())) ||
            apt.targetedSectors.some((s) => s.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  // Filter actions based on query
  const filteredViewActions = viewActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
  const filteredSponsorActions = sponsorFilterActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  // All item options combined
  const allItems = [
    ...matchingApts.map((apt) => ({ type: 'apt', data: apt, id: `apt-${apt.id}`, label: `${apt.classification} (${apt.id})` })),
    ...filteredViewActions.map((act) => ({ type: 'action-view', data: act, id: act.id, label: act.label })),
    ...filteredSponsorActions.map((act) => ({ type: 'action-sponsor', data: act, id: act.id, label: act.label })),
    { type: 'action-reset', id: 'reset-filters', label: 'Reset All Active Filters' },
  ];

  // Handle keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems.length > 0 && selectedIndex < allItems.length) {
        executeItem(allItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeItem = (item: any) => {
    if (item.type === 'apt') {
      onSelectApt(item.data);
    } else if (item.type === 'action-view') {
      onViewModeChange(item.data.mode);
    } else if (item.type === 'action-sponsor') {
      onFilterChange({ sponsoringOrgType: item.data.value });
    } else if (item.type === 'action-reset') {
      onResetFilters();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-slate-900 border border-cyan-800/80 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100 z-10"
        >
          {/* Header Search Input Bar */}
          <div className="relative border-b border-slate-800 p-4 flex items-center gap-3 bg-slate-950">
            <Command className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command, search APT, or switch view mode..."
              className="w-full bg-transparent text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
            />
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 shrink-0">
              ESC to close
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {/* Matching APT Groups Section */}
            {matchingApts.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                  Matched APT Profiles ({matchingApts.length})
                </div>
                {matchingApts.map((apt, idx) => {
                  const globalIdx = idx;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <div
                      key={apt.id}
                      onClick={() => executeItem({ type: 'apt', data: apt })}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950 border border-cyan-600 text-cyan-200' : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <span className="font-bold">{apt.classification}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({apt.id})</span>
                          <div className="text-[10px] text-slate-400">{apt.sponsoringAuthority} • {apt.frontCompany}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400 opacity-60" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* View Mode Switching Actions */}
            {filteredViewActions.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  View Mode Navigation
                </div>
                {filteredViewActions.map((act, idx) => {
                  const globalIdx = matchingApts.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  const Icon = act.icon;
                  const isActive = viewMode === act.mode;

                  return (
                    <div
                      key={act.id}
                      onClick={() => executeItem({ type: 'action-view', data: act })}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-950 border border-blue-600 text-blue-200' : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{act.label}</span>
                        {isActive && (
                          <span className="text-[9px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <kbd className="px-2 py-0.5 text-[10px] bg-slate-950 border border-slate-800 text-slate-400 rounded">
                        ⌘{act.shortcut}
                      </kbd>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sponsor Filter Actions */}
            {filteredSponsorActions.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  State Authority Filters
                </div>
                {filteredSponsorActions.map((act, idx) => {
                  const globalIdx = matchingApts.length + filteredViewActions.length + idx;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <div
                      key={act.id}
                      onClick={() => executeItem({ type: 'action-sponsor', data: act })}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-950 border border-purple-600 text-purple-200' : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Filter className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{act.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400 opacity-60" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reset Filters Action */}
            {(() => {
              const resetIdx = matchingApts.length + filteredViewActions.length + filteredSponsorActions.length;
              const isSelected = selectedIndex === resetIdx;

              return (
                <div
                  onClick={() => executeItem({ type: 'action-reset' })}
                  onMouseEnter={() => setSelectedIndex(resetIdx)}
                  className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-rose-950 border border-rose-600 text-rose-200' : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Reset All Active Filters</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] bg-slate-950 border border-slate-800 text-slate-400 rounded">
                    ESC
                  </kbd>
                </div>
              );
            })()}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="bg-slate-950 border-t border-slate-800 p-3 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-white">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-white">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-white">↵</kbd>
                <span>Select</span>
              </span>
            </div>
            <div className="text-cyan-400 flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Press ⌘K or Ctrl+K anywhere to trigger</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
