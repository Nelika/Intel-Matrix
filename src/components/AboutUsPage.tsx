import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShieldCheck,
  Globe,
  Terminal,
  Cpu,
  Lock,
  Mail,
  Key,
  Users,
  FileText,
  Award,
  ExternalLink,
  Code,
  CheckCircle,
  Database,
  Radio,
  Linkedin
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
            <Radio className="w-3 h-3 animate-ping" />
            <span className="hidden md:inline">SYSTEM STATUS: ONLINE</span>
            <span className="md:hidden">ONLINE</span>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-12">

        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-4xl mx-auto pt-4">
          
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center gap-2 font-mono text-xs text-cyan-300 tracking-widest uppercase bg-cyan-950/80 border border-cyan-800/80 px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cicada 3301 Threat Intelligence Group</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-mono font-extrabold tracking-tight text-slate-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Cicada 3301
            </h1>

            <p className="text-base sm:text-lg font-mono text-cyan-400 font-semibold">
              About Our Organization &amp; Research Mission
            </p>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl text-center transition-colors cursor-default shadow-xs"
            >
              <div className="text-2xl font-mono font-bold text-cyan-400">100+</div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">APT Profiles</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl text-center transition-colors cursor-default shadow-xs"
            >
              <div className="text-2xl font-mono font-bold text-emerald-400">24/7</div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">CISA Feed Sync</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl text-center transition-colors cursor-default shadow-xs"
            >
              <div className="text-2xl font-mono font-bold text-purple-400">15+</div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">Sectors Tracked</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl text-center transition-colors cursor-default shadow-xs"
            >
              <div className="text-2xl font-mono font-bold text-amber-400">100%</div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">Open Research</div>
            </motion.div>
          </div>

        </div>

        {/* Section 1: Organizational Overview (Lorem Ipsum) */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100 uppercase tracking-wide">
                1. Executive Summary &amp; Overview
              </h2>
              <p className="text-xs font-mono text-slate-400">Primary organizational purpose &amp; intelligence scope</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-sans">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.
            </p>
            <p>
              Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at multo elit. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/80 font-mono text-xs text-cyan-300 leading-relaxed">
              <span className="text-slate-400 uppercase block mb-1 font-bold">[ SYSTEM NOTE / DUMMY NOTICE ]</span>
              This text is provided as editable placeholder content. You can easily replace these paragraphs with your customized organization history, mission statement, or analyst disclosures.
            </div>
          </div>
        </section>

        {/* Section 2: Research Methodology & MITRE ATT&CK Alignment */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100 uppercase tracking-wide">
                2. Research Methodology &amp; Threat Intelligence Framework
              </h2>
              <p className="text-xs font-mono text-slate-400">Open source intelligence (OSINT), telemetry parsing &amp; MITRE mapping</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3 bg-slate-950/80 border border-slate-800/80 p-5 rounded-xl">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>OSINT Telemetry Ingestion</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ultricies ligula sed magna dictum porta. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/80 border border-slate-800/80 p-5 rounded-xl">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-purple-400">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span>MITRE ATT&amp;CK Integration</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Pellentesque in ipsum id orci porta dapibus. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Vivamus suscipit tortor eget felis porttitor volutpat.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/80 border border-slate-800/80 p-5 rounded-xl">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>CISA ICS Advisory Correlation</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Donec sollicitudin molestie malesuada. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Proin eget tortor risus.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/80 border border-slate-800/80 p-5 rounded-xl">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Attribution &amp; Legal Disclosures</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Curabitur aliquet quam id dui posuere blandit. Lorem ipsum dolor sit amet.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Team & Research Leadership (Editable Cards) */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100 uppercase tracking-wide">
                  3. Intelligence Team &amp; Contributors
                </h2>
                <p className="text-xs font-mono text-slate-400">Lead analysts, reverse engineers &amp; security authors</p>
              </div>
            </div>

            <a
              href="https://www.linkedin.com/in/govind-nelika/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>Lead Author: Govind Nelika</span>
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-xl space-y-3 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 font-mono font-bold">
                  GN
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-100">Govind Nelika</h3>
                  <p className="text-[11px] font-mono text-cyan-400">Lead Cyber Threat Architect</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-xl space-y-3 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 font-mono font-bold">
                  AR
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-100">Analyst Research Team</h3>
                  <p className="text-[11px] font-mono text-purple-400">Malware Reverse Engineering</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-xl space-y-3 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-300 font-mono font-bold">
                  CI
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-100">Cicada 3301 Collective</h3>
                  <p className="text-[11px] font-mono text-emerald-400">Open Source Threat Intel</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi.
              </p>
            </motion.div>

          </div>
        </section>

        {/* Section 4: Secure Contact & PGP Encryption Key Placeholder */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100 uppercase tracking-wide">
                4. Confidential Intelligence Submissions &amp; Contact
              </h2>
              <p className="text-xs font-mono text-slate-400">Encrypted communications &amp; reporting channel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4 font-sans text-sm text-slate-300">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>intel@cicada3301-matrix.org</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Key className="w-4 h-4 text-slate-400" />
                  <span>PGP Key ID: 0x3301CICADA42901F</span>
                </div>
              </div>
            </div>

            {/* Dummy Encrypted PGP Block */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-[11px] text-slate-400 space-y-1 select-all overflow-x-auto">
              <div className="text-cyan-400 font-bold mb-1">-----BEGIN PGP PUBLIC KEY BLOCK-----</div>
              <div>mQENBF/Cicada3301IntelMatrixKeyPlaceholder...</div>
              <div>v1A00289B838FC1A908234857203948572039847...</div>
              <div>x098457209384752093847520938475209384752...</div>
              <div>+293847520938475209384752093847520938475...</div>
              <div className="text-cyan-400 font-bold mt-1">-----END PGP PUBLIC KEY BLOCK-----</div>
            </div>

          </div>
        </section>

        {/* Footer Back Button */}
        <div className="text-center pt-6 pb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 border border-cyan-400/80 text-cyan-200 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Return to China APT Threat Intelligence Matrix</span>
          </motion.button>
        </div>

      </main>

    </div>
  );
};
