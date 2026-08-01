import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AptGroup } from '../types';
import {
  generateAttackNavigatorLayer,
  generateStix21Bundle,
  generateMitrePythonScript,
  downloadBlob,
} from '../utils/mitreAttackIntegration';
import {
  Terminal,
  Download,
  Copy,
  Check,
  Code2,
  Layers,
  FileJson,
  ExternalLink,
  Sparkles,
  Play,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  BookOpen,
  Sliders,
  Loader2,
} from 'lucide-react';

interface MitreAttackSectionProps {
  data: AptGroup[];
  onSelectApt?: (apt: AptGroup) => void;
}

export const MitreAttackSection: React.FC<MitreAttackSectionProps> = ({ data, onSelectApt }) => {
  const [activeTab, setActiveTab] = useState<'navigator' | 'stix' | 'python'>('python');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRunningSim, setIsRunningSim] = useState(false);

  // Filter dataset based on selected APT group
  const activeGroup = selectedGroupFilter === 'all'
    ? null
    : data.find((g) => g.id === selectedGroupFilter) || null;

  const datasetToProcess = activeGroup ? [activeGroup] : data;

  // Generated Artifacts
  const layerData = generateAttackNavigatorLayer(
    datasetToProcess,
    activeGroup
      ? `${activeGroup.classification} (${activeGroup.id}) ATT&CK Layer`
      : 'China APT Threat Intelligence Matrix Layer'
  );
  const layerJsonString = JSON.stringify(layerData, null, 2);

  const stixData = generateStix21Bundle(datasetToProcess);
  const stixJsonString = JSON.stringify(stixData, null, 2);

  const pythonScript = generateMitrePythonScript(activeGroup || undefined);

  // Helper to build realistic terminal stdout output
  const generateStdoutLogs = () => {
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const groupNameStr = activeGroup ? `${activeGroup.classification} (${activeGroup.id})` : `All ${datasetToProcess.length} China APT Threat Actors`;
    const techCount = layerData.techniques.length;
    
    return [
      `[${timeStr}] INFO  mitreattack.stix20: Initializing STIX 2.1 memory cache...`,
      `[${timeStr}] INFO  mitreattack.stix20: Successfully loaded enterprise-attack v14.1 database.`,
      `[${timeStr}] INFO  processor: Ingesting dataset context -> ${groupNameStr}`,
      `[${timeStr}] DEBUG processor: Extracted ${datasetToProcess.length} STIX 2.1 'intrusion-set' domain objects.`,
      `[${timeStr}] INFO  mitreattack.navlayers: Mapping techniques across Enterprise Tactics (Initial Access -> Exfiltration)...`,
      `[${timeStr}] SUCCESS mapped ${techCount} unique MITRE ATT&CK techniques.`,
      `[${timeStr}] INFO  navlayer_generator: Building ATT&CK Navigator Layer v4.5 object...`,
      `[${timeStr}] SUCCESS Generated layer with gradient color scale (min=1, max=${Math.max(...layerData.techniques.map(t=>t.score||1))}).`,
      `[${timeStr}] OUTPUT Wrote layer file: layer_${activeGroup ? activeGroup.id.toLowerCase() : 'china_apts'}.json (${(layerJsonString.length / 1024).toFixed(2)} KB)`,
      `----------------------------------------------------------------------------------`,
      `[STDOUT SUMMARY REPORT]`,
      `  • Target Scope: ${groupNameStr}`,
      `  • Primary Sponsor: ${activeGroup ? activeGroup.sponsor : 'MSS / PLA / State-Sponsored'}`,
      `  • Total TTPs Mapped: ${techCount} techniques`,
      `  • Top Tactics Identified: ${Array.from(new Set(datasetToProcess.flatMap(g => g.tacticsUsed))).slice(0, 5).join(', ')}`,
      `----------------------------------------------------------------------------------`,
      `Process finished with exit code 0`
    ].join('\n');
  };

  const [simOutput, setSimOutput] = useState<string>(generateStdoutLogs());

  // Update simOutput when activeGroup or dataset changes
  React.useEffect(() => {
    setSimOutput(generateStdoutLogs());
  }, [selectedGroupFilter, data.length]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunPythonSimulation = () => {
    setIsRunningSim(true);
    setSimOutput('Executing Python interpreter... [python -m mitreattack_script]');

    setTimeout(() => {
      setIsRunningSim(false);
      setSimOutput(generateStdoutLogs());
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-950 border border-cyan-900/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-6"
    >
      {/* Top Laser Accent Border */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400" />

      {/* Header Banner */}
      <div className="p-6 bg-slate-900/90 border-b border-cyan-900/60 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-cyan-950 border border-cyan-700/80 text-cyan-300 rounded tracking-wider uppercase shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                MITRE ATT&CK Python Integration
              </span>
              <a
                href="https://github.com/mitre-attack/mitreattack-python"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 hover:underline"
              >
                <span>mitre-attack/mitreattack-python</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-2.5">
              <Terminal className="w-7 h-7 text-cyan-400 animate-pulse" />
              <span>MITRE ATT&CK® Python Integration Toolkit</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-3xl leading-relaxed">
              Programmatic STIX 2.1 data parsing, ATT&CK Navigator v4.5 heatmap layer generation, and official Python SDK integration derived from the China APT Threat Intelligence Matrix.
            </p>
          </div>

          {/* Target Group Selector */}
          <div className="shrink-0 bg-slate-950 p-3 rounded-xl border border-cyan-800/60 flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>Target Group Context</span>
            </label>
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="bg-slate-900 border border-cyan-700/80 text-cyan-200 text-xs font-mono py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">All {data.length} Filtered APT Groups</option>
              {data.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.classification} ({group.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 p-3 bg-slate-950 border-b border-cyan-900/60 px-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('navigator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'navigator'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/80 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>ATT&CK Navigator Heatmap Layer</span>
        </button>

        <button
          onClick={() => setActiveTab('stix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'stix'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileJson className="w-4 h-4 text-emerald-400" />
          <span>STIX 2.1 Threat Objects</span>
        </button>

        <button
          onClick={() => setActiveTab('python')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'python'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4 text-amber-400" />
          <span>`mitreattack-python` SDK Script</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 space-y-6">
        {activeTab === 'navigator' && (
          <div className="space-y-6">
            {/* Visual Heatmap Overview */}
            <div className="bg-slate-900/80 border border-cyan-800/60 p-5 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Mapped ATT&CK Techniques Heatmap ({layerData.techniques.length} Techniques)</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    Color-coded by group occurrence frequency according to ATT&CK Layer v4.5 specification.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-500 inline-block" /> High (3+ Groups)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Medium (2 Groups)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-cyan-500 inline-block" /> Observed (1 Group)
                  </span>
                </div>
              </div>

              {/* Technique Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {layerData.techniques.map((tech) => (
                  <div
                    key={tech.techniqueID}
                    className="p-2.5 rounded-lg border text-center transition-all hover:scale-105 cursor-pointer"
                    style={{
                      borderColor: tech.color || '#06b6d4',
                      backgroundColor: `${tech.color}15`,
                    }}
                    title={tech.comment}
                  >
                    <div className="font-mono font-bold text-xs" style={{ color: tech.color }}>
                      {tech.techniqueID}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5 truncate font-sans">
                      {tech.comment?.replace('Observed in APT Groups: ', '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* JSON Code Viewer */}
            <div className="relative">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-x border-t border-slate-800 rounded-t-xl text-xs font-mono text-slate-400">
                <span>ATT&CK Navigator Layer Schema (v4.5)</span>
                <button
                  onClick={() => handleCopy(layerJsonString, 'layer')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedId === 'layer' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'layer' ? 'Copied' : 'Copy Layer JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl text-cyan-300/90 text-[11px] font-mono leading-relaxed max-h-80 overflow-y-auto">
                {layerJsonString}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'stix' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-sans leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono font-bold text-emerald-300 block mb-0.5">
                  STIX 2.1 Specification Object Stream
                </strong>
                Structured JSON data bundle formatted as <code className="text-emerald-300 font-mono">intrusion-set</code> domain objects with MITRE ATT&CK external references, suitable for direct ingestion into <code className="text-emerald-300 font-mono">mitreattack-python</code> and TIP platforms.
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-x border-t border-slate-800 rounded-t-xl text-xs font-mono text-slate-400">
                <span>STIX 2.1 Bundle JSON</span>
                <button
                  onClick={() => handleCopy(stixJsonString, 'stix')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedId === 'stix' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'stix' ? 'Copied' : 'Copy STIX JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl text-emerald-300/90 text-[11px] font-mono leading-relaxed max-h-80 overflow-y-auto">
                {stixJsonString}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'python' && (
          <div className="space-y-6">
            {/* Quick Install Banner */}
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-amber-300">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Installation: <code className="text-white bg-slate-950 px-2 py-1 rounded border border-amber-800/50">pip install mitreattack-python stix2 pandas</code></span>
              </div>
              <button
                onClick={() => handleCopy('pip install mitreattack-python stix2 pandas', 'pip')}
                className="px-3 py-1 bg-amber-900/60 hover:bg-amber-800 border border-amber-600/60 text-amber-200 rounded text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
              >
                {copiedId === 'pip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'pip' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>

            {/* Python Script Viewer */}
            <div className="relative">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-x border-t border-slate-800 rounded-t-xl text-xs font-mono text-slate-400">
                <span>python_mitre_integration.py</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunPythonSimulation}
                    disabled={isRunningSim}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold rounded text-[11px] flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] cursor-pointer"
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
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === 'script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'script' ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 text-amber-300/90 text-[11px] font-mono leading-relaxed max-h-80 overflow-y-auto">
                {pythonScript}
              </pre>
            </div>

            {/* Simulation Terminal Output */}
            {simOutput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-950 border border-amber-500/50 rounded-xl font-mono text-xs text-amber-200/90 leading-relaxed shadow-inner space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Python Code Execution Output (stdout)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/80 rounded">
                    Exit Code: 0
                  </span>
                </div>
                <pre className="p-3 bg-slate-900/90 rounded-lg text-[11px] font-mono text-amber-200/90 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                  {simOutput}
                </pre>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Footer Export Actions */}
      <div className="p-5 bg-slate-950 border-t border-cyan-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Documentation: <a href="https://mitreattack-python.readthedocs.io/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">mitreattack-python docs</a></span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() =>
              downloadBlob(
                `china_apt_navigator_layer_${new Date().toISOString().split('T')[0]}.json`,
                layerJsonString,
                'application/json'
              )
            }
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs rounded-lg transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Layer JSON</span>
          </button>

          <button
            onClick={() =>
              downloadBlob(
                `china_apt_stix2.1_bundle_${new Date().toISOString().split('T')[0]}.json`,
                stixJsonString,
                'application/json'
              )
            }
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs rounded-lg transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download STIX 2.1</span>
          </button>

          <button
            onClick={() =>
              downloadBlob('china_apt_mitreattack_script.py', pythonScript, 'text/x-python')
            }
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs rounded-lg transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Python Script</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
