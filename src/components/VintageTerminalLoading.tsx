import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal, Power, CornerDownLeft } from 'lucide-react';

interface VintageTerminalLoadingProps {
  onComplete: () => void;
}

export const VintageTerminalLoading: React.FC<VintageTerminalLoadingProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const script = [
    'MS-DOS Version 6.22 (C)Copyright ThreatIntel Corp 1981-2026.',
    'MEMORY TEST: 640KB BASE OK / 16384KB EXTENDED OK',
    '',
    'C:\\> initiating user "govindnelika"',
    'C:\\> AUTH_TOKEN: ENCRYPTED_RSA_4096_VERIFIED',
    'C:\\> loading China APT Threat Intelligence Matrix 中华人民共和国...',
    'C:\\> [ OK ] Correlating MITRE ATT&CK Campaign Dataset [C0014]',
    'C:\\> [ OK ] Unsealing DOJ Indictments & State Sponsor Dossiers',
    'C:\\> China APT Threat Intelligence Matrix 中华人民共和国 ONLINE.',
    '',
    'SYSTEM READY.'
  ];

  // Auto-focus window & hidden input so key events work reliably inside iFrame
  useEffect(() => {
    window.focus();
    hiddenInputRef.current?.focus();
    containerRef.current?.focus();

    const focusTimer = setTimeout(() => {
      window.focus();
      hiddenInputRef.current?.focus();
      containerRef.current?.focus();
    }, 150);

    return () => clearTimeout(focusTimer);
  }, []);

  // Keyboard listener with event capture for Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isEnter =
        e.key === 'Enter' ||
        e.key === 'NumpadEnter' ||
        e.key === 'Return' ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        e.keyCode === 13;

      if (isEnter) {
        e.preventDefault();
        e.stopPropagation();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyDown, true);
    };
  }, [onComplete]);

  useEffect(() => {
    if (currentLineIndex >= script.length) {
      setIsFinished(true);
      return; // Do NOT auto-dismiss; wait for user input
    }

    const targetLine = script[currentLineIndex];

    if (targetLine === '') {
      setLines((prev) => [...prev, '']);
      setCurrentLineIndex((prev) => prev + 1);
      return;
    }

    if (currentCharIndex < targetLine.length) {
      const isFast = targetLine.startsWith('MS-DOS') || targetLine.startsWith('MEMORY');
      const speed = isFast ? 8 : 22;

      const timeout = setTimeout(() => {
        setLines((prev) => {
          const updated = [...prev];
          if (updated.length <= currentLineIndex) {
            updated.push('');
          }
          updated[currentLineIndex] = targetLine.slice(0, currentCharIndex + 1);
          return updated;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      const lineDelay = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, targetLine.startsWith('C:\\>') ? 200 : 100);

      return () => clearTimeout(lineDelay);
    }
  }, [currentLineIndex, currentCharIndex]);

  return (
    <motion.div
      ref={containerRef}
      tabIndex={0}
      autoFocus
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      onClick={() => {
        hiddenInputRef.current?.focus();
        onComplete();
      }}
      className="fixed inset-0 z-50 bg-[#070b09] text-emerald-400 font-mono flex flex-col justify-between p-4 sm:p-10 select-none overflow-hidden cursor-pointer focus:outline-none"
      style={{
        fontFamily: '"Courier New", Courier, monospace',
      }}
    >
      {/* Hidden input to hold keyboard focus inside iFrame */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute top-0 left-0 w-0 h-0 p-0 border-0 pointer-events-none"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.code === 'Enter') {
            onComplete();
          }
        }}
      />

      {/* Subtle Scanline CRT Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 opacity-15"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* CRT Corner Vignette */}
      <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_80px_rgba(0,0,0,0.95)]" />

      {/* Top Bar Minimalist HUD */}
      <div className="relative z-30 flex items-center justify-between border-b border-emerald-900/40 pb-3 text-xs tracking-widest text-emerald-600/90 uppercase">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>SYS_BOOT // TTY1</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-emerald-700/80">USER: GOVINDNELIKA</span>
          <button
            onClick={onComplete}
            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-400 text-[11px] tracking-wider transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
          >
            <span>[ENTER] LAUNCH</span>
            <Power className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Terminal Screen Content */}
      <div className="relative z-30 my-auto py-6 max-w-3xl w-full mx-auto font-mono text-xs sm:text-sm leading-relaxed space-y-2 drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]">
        {lines.map((line, idx) => {
          const isUserLine = line.includes('initiating user "govindnelika"');
          const isMatrixLine = line.includes('APT Threat Intelligence Matrix');

          return (
            <div key={idx} className="min-h-[1.4rem] flex items-center gap-1">
              <span
                className={
                  isUserLine
                    ? 'text-amber-300 font-bold drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]'
                    : isMatrixLine
                    ? 'text-emerald-200 font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.7)] text-sm sm:text-base'
                    : line.includes('[ OK ]')
                    ? 'text-emerald-300'
                    : 'text-emerald-500/90'
                }
              >
                {line}
              </span>

              {/* Blinking retro cursor at active line */}
              {idx === currentLineIndex && !isFinished && (
                <span className="inline-block w-2.5 h-4 bg-emerald-400 animate-pulse align-middle ml-0.5" />
              )}
            </div>
          );
        })}

        {/* Finished State Prompt - Requires Enter Key or Click on Enter button */}
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-emerald-900/40 mt-4"
          >
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span>C:\&gt; PRESS [ENTER] TO LAUNCH MATRIX</span>
            </div>

            <button
              onClick={onComplete}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.7)]"
            >
              <CornerDownLeft className="w-4 h-4" />
              <span>ENTER MATRIX [ENTER]</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer minimal status */}
      <div className="relative z-30 border-t border-emerald-900/40 pt-3 flex items-center justify-between text-[10px] text-emerald-700/80 font-mono tracking-wider uppercase">
        <div>STATUS: WAITING FOR USER INPUT [ENTER]</div>
        <div>SESSION_ID: #0084-2026</div>
      </div>
    </motion.div>
  );
};


