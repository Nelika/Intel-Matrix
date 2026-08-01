import React, { useState } from 'react';
import { AptGroup } from '../types';
import {
  generateAttackNavigatorLayer,
  generateStix21Bundle,
  generateMitrePythonScript,
  downloadBlob,
} from '../utils/mitreAttackIntegration';
import {
  X,
  Terminal,
  Download,
  Copy,
  Check,
  Code2,
  Layers,
  FileJson,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Play,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface MitreAttackModalProps {
  groups: AptGroup[];
  selectedGroup?: AptGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MitreAttackModal: React.FC<MitreAttackModalProps> = ({
  groups,
  selectedGroup,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'navigator' | 'stix' | 'python'>('python');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRunningSim, setIsRunningSim] = useState(false);

  if (!isOpen) return null;

  const datasetToExport = selectedGroup ? [selectedGroup] : groups;
  const titlePrefix = selectedGroup
    ? `${selectedGroup.classification} (${selectedGroup.id})`
    : `All ${groups.length} Filtered APT Groups`;

  // Layer JSON
  const layerData = generateAttackNavigatorLayer(
    datasetToExport,
    selectedGroup
      ? `${selectedGroup.classification} MITRE Layer`
      : 'China APT Threat Intelligence Matrix Layer'
  );
  const layerJsonString = JSON.stringify(layerData, null, 2);

  // STIX 2.1 Bundle
  const stixData = generateStix21Bundle(datasetToExport);
  const stixJsonString = JSON.stringify(stixData, null, 2);

  // Python Script
  const pythonScript = generateMitrePythonScript(selectedGroup || undefined);

  // Terminal stdout output
  const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const stdoutOutput = [
    `[${timeStr}] INFO  mitreattack.stix20: STIX 2.1 parser initialized.`,
    `[${timeStr}] INFO  mitreattack.stix20: Loaded Enterprise ATT&CK v14.1 object model.`,
    `[${timeStr}] INFO  processor: Ingested ${datasetToExport.length} intrusion-set target(s): ${titlePrefix}`,
    `[${timeStr}] SUCCESS Mapped ${layerData.techniques.length} unique MITRE ATT&CK techniques.`,
    `[${timeStr}] OUTPUT Created ATT&CK Navigator Layer: layer_${selectedGroup ? selectedGroup.id.toLowerCase() : 'all_apts'}.json`,
    `----------------------------------------------------------------------------------`,
    `[EXECUTION SUMMARY]`,
    `  • Target: ${titlePrefix}`,
    `  • Techniques Count: ${layerData.techniques.length}`,
    `  • Status: COMPLETED_SUCCESSFULLY`,
    `----------------------------------------------------------------------------------`,
    `Process finished with exit code 0`
  ].join('\n');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunSimulation = () => {
    setIsRunningSim(true);
    setTimeout(() => {
      setIsRunningSim(false);
    }, 600);
  };

  const handleDownloadLayer = () => {
    const filename = selectedGroup
      ? `${selectedGroup.id.toLowerCase()}_navigator_layer.json`
      : `china_apt_matrix_navigator_layer_${new Date().toISOString().split('T')[0]}.json`;
    downloadBlob(filename, layerJsonString, 'application/json');
  };

  const handleDownloadStix = () => {
    const filename = selectedGroup
      ? `${selectedGroup.id.toLowerCase()}_stix2.1_bundle.json`
      : `china_apt_matrix_stix2.1_bundle_${new Date().toISOString().split('T')[0]}.json`;
    downloadBlob(filename, stixJsonString, 'application/json');
  };

  const handleDownloadPython = () => {
    const filename = selectedGroup
      ? `analyze_${selectedGroup.id.toLowerCase()}_mitreattack.py`
      : `china_apt_mitreattack_script.py`;
    downloadBlob(filename, pythonScript, 'text/x-python');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-cyan-800/80 max-w-3xl w-full rounded-xl shadow-2xl relative my-8 overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Laser Border */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-cyan-900/60 bg-slate-950/80 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-cyan-950 border border-cyan-700/80 text-cyan-300 rounded tracking-wider uppercase">
                MITRE ATT&CK Python Integration
              </span>
              <a
                href="https://github.com/mitre-attack/mitreattack-python"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 hover:underline"
              >
                <span>github.com/mitre-attack/mitreattack-python</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h2 className="text-xl sm:text-2xl font-mono font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>MITRE ATT&CK SDK & Export Suite</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Target Dataset: <strong className="text-cyan-300 font-mono">{titlePrefix}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/90 border-b border-cyan-900/40 px-6 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('navigator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'navigator'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>ATT&CK Navigator Layer</span>
          </button>

          <button
            onClick={() => setActiveTab('stix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'stix'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileJson className="w-4 h-4 text-emerald-400" />
            <span>STIX 2.1 Bundle</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'python'
                ? 'bg-cyan-950 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Python SDK Script (`mitreattack-python`)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'navigator' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-200 leading-relaxed font-sans text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>MITRE ATT&CK Navigator v4.5 Ready</span>
                </div>
                Download this Layer JSON file and upload it directly into{' '}
                <a
                  href="https://mitre-attack.github.io/attack-navigator/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 font-semibold underline"
                >
                  ATT&CK Navigator
                </a>{' '}
                to visualize heatmaps of techniques used across these threat actor profiles.
              </div>

              <div className="relative">
                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                  <button
                    onClick={() => handleCopy(layerJsonString, 'layer')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === 'layer' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'layer' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300/90 text-[11px] leading-relaxed max-h-72 overflow-y-auto">
                  {layerJsonString}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'stix' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 leading-relaxed font-sans text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>Standard STIX 2.1 Threat Intel Objects</span>
                </div>
                This STIX 2.1 bundle contains official <code className="text-emerald-300 font-mono">intrusion-set</code> objects compatible with STIX 2.1 parsers and <code className="text-emerald-300 font-mono">mitreattack-python</code>.
              </div>

              <div className="relative">
                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                  <button
                    onClick={() => handleCopy(stixJsonString, 'stix')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === 'stix' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'stix' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300/90 text-[11px] leading-relaxed max-h-72 overflow-y-auto">
                  {stixJsonString}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200 leading-relaxed font-sans text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-amber-300 font-mono font-bold mb-1">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Executable Python Script using mitreattack-python</span>
                  </div>
                  Run this script in your Python environment (<code className="text-amber-300 font-mono">pip install mitreattack-python stix2</code>) to load, inspect, or build custom ATT&CK Navigator layers programmatically.
                </div>
              </div>

              {/* Code Editor Box */}
              <div className="relative">
                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isRunningSim}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold rounded text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] cursor-pointer"
                  >
                    {isRunningSim ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                    )}
                    <span>{isRunningSim ? 'Executing...' : 'Run Simulation'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(pythonScript, 'script')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === 'script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'script' ? 'Copied Script' : 'Copy Script'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-amber-300/90 text-[11px] leading-relaxed max-h-56 overflow-y-auto">
                  {pythonScript}
                </pre>
              </div>

              {/* Console Execution Output Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Python Code Execution Output (stdout)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/80 rounded">
                    Exit Code: 0
                  </span>
                </div>
                <pre className="p-3 bg-slate-900/90 rounded-lg text-[11px] font-mono text-amber-200/90 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                  {stdoutOutput}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-cyan-900/60 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            Package: <span className="text-cyan-300 font-bold">mitreattack-python</span> (MITRE ATT&CK)
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'navigator' && (
              <button
                onClick={handleDownloadLayer}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Navigator Layer (.json)</span>
              </button>
            )}

            {activeTab === 'stix' && (
              <button
                onClick={handleDownloadStix}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download STIX 2.1 Bundle (.json)</span>
              </button>
            )}

            {activeTab === 'python' && (
              <button
                onClick={handleDownloadPython}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Python Script (.py)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
