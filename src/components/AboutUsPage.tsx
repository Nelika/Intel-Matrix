import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  Terminal,
  Radio,
  Clock,
  Sparkles,
  Database,
  Globe,
  Cpu,
  Lock,
  FileText,
  ChevronRight
} from 'lucide-react';

interface AboutUsPageProps {
  onBack: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Background Cyber Grid & Glow Effects */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-cyan-900/60 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <motion.button
            whileHover={{ scale: 1.03, x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Threat Matrix</span>
          </motion.button>

          {/* Cicada 3301 Header Branding */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-extrabold tracking-widest text-slate-100">CICADA 3301</span>
              <span className="text-[10px] font-mono text-cyan-400/80">RESEARCH &amp; INTELLIGENCE LABS</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-md">
            <Radio className="w-3 h-3 animate-ping text-emerald-400" />
            <span className="hidden md:inline">SYSTEM STATUS: ONLINE</span>
            <span className="md:hidden">ONLINE</span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-10">

        {/* Hero & Retained Metrics Bar Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-2">
          
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center gap-2 font-mono text-xs text-cyan-300 tracking-widest uppercase bg-cyan-950/80 border border-cyan-800/80 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cicada 3301 Threat Intelligence Group</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold tracking-tight text-slate-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Cicada 3301
            </h1>

            <p className="text-base sm:text-lg font-mono text-cyan-400 font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>About Us Portion — Coming Soon</span>
            </p>
          </div>

          {/* Retained Quick Metrics Bar (100+ APT Profiles, 24/7 CISA Sync, etc.) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2">
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 p-4 rounded-xl text-center transition-all cursor-default shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <div className="text-2xl font-mono font-bold text-cyan-400">100+</div>
              <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1 font-semibold">APT Profiles</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 p-4 rounded-xl text-center transition-all cursor-default shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <div className="text-2xl font-mono font-bold text-emerald-400">24/7</div>
              <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1 font-semibold">CISA Feed Sync</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 p-4 rounded-xl text-center transition-all cursor-default shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              <div className="text-2xl font-mono font-bold text-purple-400">15+</div>
              <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1 font-semibold">Sectors Tracked</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 p-4 rounded-xl text-center transition-all cursor-default shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <div className="text-2xl font-mono font-bold text-amber-400">100%</div>
              <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider mt-1 font-semibold">Open Research</div>
            </motion.div>
          </div>

        </div>

        {/* Coming Soon Feature Card for About Us Portion */}
        <section className="bg-slate-900/80 border border-cyan-800/80 rounded-2xl p-8 sm:p-12 text-center space-y-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Section Under Development</span>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 tracking-tight">
              About Us Portion — Coming Soon
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              Our comprehensive organizational history, analyst team disclosures, and reverse-engineering research methodologies are currently being compiled and will be published here in an upcoming intelligence release.
            </p>
          </div>

          {/* Feature Roadmap Preview Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>APT Whitepapers</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Detailed attribution reports and technical malware campaign breakdowns.
              </p>
            </div>

            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted Submissions</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Direct PGP channel for confidential malware sample and telemetry submissions.
              </p>
            </div>

            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
                <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Analyst Directory</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Verified researcher profiles and threat intelligence contributor credits.
              </p>
            </div>
          </div>

          {/* CTA Button to return to Threat Matrix */}
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              <span>Explore Active 100+ APT Profiles</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </motion.button>
          </div>

        </section>

        {/* Footer Return Navigation */}
        <div className="text-center pt-2 pb-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to China APT Threat Intelligence Matrix</span>
          </button>
        </div>

      </main>

    </div>
  );
};

