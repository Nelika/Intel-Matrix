import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, X, Search, Table, LayoutGrid, Clock, Activity, Share2, Terminal, Filter, RefreshCw, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Global & Navigation',
      shortcuts: [
        { key: '⌘ K / Ctrl+K', description: 'Open Quick Command Palette / Search' },
        { key: '? / Shift+?', description: 'Toggle Keyboard Shortcuts Cheat Sheet' },
        { key: 'Esc', description: 'Close modals or clear active search' },
      ],
    },
    {
      category: 'View Mode Switcher',
      shortcuts: [
        { key: '⌘ 1 / Ctrl+1', description: 'Switch to Matrix Table View' },
        { key: '⌘ 2 / Ctrl+2', description: 'Switch to Card Grid View' },
        { key: '⌘ 7 / Ctrl+7', description: 'Switch to Side-by-Side Comparison View' },
        { key: '⌘ 3 / Ctrl+3', description: 'Switch to Legal Timeline View' },
        { key: '⌘ 4 / Ctrl+4', description: 'Switch to Activity Graph View' },
        { key: '⌘ 5 / Ctrl+5', description: 'Switch to Network Topology View' },
        { key: '⌘ 6 / Ctrl+6', description: 'Switch to MITRE ATT&CK SDK View' },
      ],
    },
    {
      category: 'Data & Filters',
      shortcuts: [
        { key: '⌘ R / Ctrl+Alt+R', description: 'Reset all active filters' },
        { key: 'Click Legend / Pill', description: 'Filter matrix dataset dynamically by sector or authority' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden font-mono text-slate-100 z-10 p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
                <Keyboard className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-cyan-400 uppercase tracking-wider">
                  Keyboard Shortcut Directory
                </h2>
                <p className="text-xs text-slate-400">Quickly trigger search, views, and commands with hotkeys</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shortcut Groups */}
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
            {shortcutGroups.map((group) => (
              <div key={group.category} className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800/80 pb-1">
                  {group.category}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {group.shortcuts.map((sc) => (
                    <div
                      key={sc.key}
                      className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs"
                    >
                      <span className="text-slate-300 font-medium">{sc.description}</span>
                      <kbd className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-cyan-300 rounded-lg text-[11px] font-bold shadow-xs">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              Shortcuts work anywhere across the platform
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-200 text-xs rounded-lg transition-colors cursor-pointer font-bold"
            >
              Close (ESC)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
