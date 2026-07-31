import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Download, FileCode, Radio, Database } from 'lucide-react';
import { AptGroup } from '../types';

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  filteredData: AptGroup[];
}

export const Header: React.FC<HeaderProps> = ({ totalCount, filteredCount, filteredData }) => {
  const exportCSV = () => {
    const headers = [
      'MITRE ATT&CK ID',
      'APT / Classification',
      'Major Aliases / Associated Groups',
      'Sponsoring State Authority',
      'Front Company / Contractor Entity',
      'Primary Targeted Sectors',
      'Legal and Regulatory Actions',
    ];

    const rows = filteredData.map((item) => [
      `"${item.id}"`,
      `"${item.classification}"`,
      `"${item.aliases.join(', ')}"`,
      `"${item.sponsoringAuthority.replace(/"/g, '""')}"`,
      `"${item.frontCompany.replace(/"/g, '""')}"`,
      `"${item.rawTargetedSectors.replace(/"/g, '""')}"`,
      `"${item.legalActions.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apt_threat_matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredData, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `apt_threat_matrix_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Status */}
          <div className="flex items-start gap-3.5">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 mt-0.5 shrink-0 shadow-xs cursor-pointer"
            >
              <ShieldAlert className="w-6 h-6" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                  INTEL MATRIX
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  LIVE DATABASE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-slate-900">
                APT Threat Intelligence Matrix
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-sans mt-0.5 leading-relaxed">
                Comprehensive mapping of state-sponsored Advanced Persistent Threat groups, front entities, targeted sectors, and regulatory actions.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-auto">
            <motion.div
              layout
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <motion.span
                key={filteredCount}
                initial={{ scale: 1.2, color: '#2563eb' }}
                animate={{ scale: 1, color: '#334155' }}
                transition={{ duration: 0.3 }}
                className="font-semibold"
              >
                {filteredCount} / {totalCount} Records
              </motion.span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportCSV}
              title="Export visible matrix data to CSV"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 text-xs font-mono font-medium transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export CSV</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={exportJSON}
              title="Export visible matrix data to JSON"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 text-xs font-mono font-medium transition-colors shadow-xs"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>Export JSON</span>
            </motion.button>
          </div>

        </div>
      </div>
    </motion.header>
  );
};

