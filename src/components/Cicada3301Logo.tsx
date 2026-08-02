import React from 'react';

interface Cicada3301LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  darkVariant?: boolean;
}

export const Cicada3301Logo: React.FC<Cicada3301LogoProps> = ({
  className = "w-8 h-8",
  size = 32,
  showText = false,
  darkVariant = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center ${darkVariant ? 'p-2 rounded-xl bg-black border border-red-900/60 shadow-[0_0_25px_rgba(239,68,68,0.2)]' : ''}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 500 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        >
          <defs>
            {/* Red rim glow gradient for wings & rear */}
            <radialGradient id="redRimGlow" cx="50%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#991b1b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            
            {/* Silver metallic body gradient */}
            <linearGradient id="silverMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Wing vein glow */}
            <filter id="wingGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subtle Ambient Red Glow under body and lower wings */}
          <ellipse cx="250" cy="220" rx="140" ry="80" fill="url(#redRimGlow)" opacity="0.85" />

          {/* Cicada Body - Head & Eyes */}
          <circle cx="250" cy="90" r="18" fill="url(#silverMetallic)" />
          <circle cx="222" cy="90" r="11" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
          <circle cx="278" cy="90" r="11" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
          
          {/* Ocelli eyes */}
          <circle cx="243" cy="78" r="2.5" fill="#ef4444" />
          <circle cx="250" cy="75" r="2.5" fill="#ef4444" />
          <circle cx="257" cy="78" r="2.5" fill="#ef4444" />

          {/* Antennae */}
          <path d="M 235 78 L 210 45" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 265 78 L 290 45" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />

          {/* Thorax */}
          <path
            d="M 220 100 C 220 100, 250 110, 280 100 C 292 120, 286 145, 280 155 C 250 168, 220 158, 220 155 C 214 145, 208 120, 220 100 Z"
            fill="url(#silverMetallic)"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Thorax inner carving */}
          <path d="M 235 108 L 250 138 L 265 108" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M 240 120 L 250 148 L 260 120" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

          {/* Abdomen Segments with Red Rim Highlights */}
          <path d="M 222 158 C 235 163, 265 163, 278 158 L 274 180 C 260 185, 240 185, 226 180 Z" fill="#94a3b8" stroke="#ef4444" strokeWidth="1" />
          <path d="M 226 182 C 238 187, 262 187, 274 182 L 270 204 C 258 209, 242 209, 230 204 Z" fill="#64748b" stroke="#ef4444" strokeWidth="1" />
          <path d="M 230 206 C 240 211, 260 211, 270 206 L 265 228 C 255 233, 245 233, 235 228 Z" fill="#475569" stroke="#dc2626" strokeWidth="1.5" />
          <path d="M 235 230 C 242 234, 258 234, 265 230 L 258 255 C 253 259, 247 259, 242 255 Z" fill="#334155" stroke="#ef4444" strokeWidth="1.5" />
          <path d="M 242 257 L 250 285 L 258 257 Z" fill="#ef4444" stroke="#f87171" strokeWidth="1" />

          {/* Legs */}
          <path d="M 215 115 L 180 125 L 160 150" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 285 115 L 320 125 L 340 150" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 218 140 L 175 162 L 152 192" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 282 140 L 325 162 L 348 192" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 225 165 L 190 202 L 172 238" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 275 165 L 310 202 L 328 238" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* LEFT FOREWING - Ultra Detailed Translucent Lattice */}
          <g filter="url(#wingGlow)">
            <path
              d="M 220 100 C 180 65, 90 35, 25 30 C 5 28, 0 42, 10 58 C 35 98, 118 148, 215 152 Z"
              fill="#ffffff"
              fillOpacity="0.08"
              stroke="#e2e8f0"
              strokeWidth="3.5"
            />
            {/* Main veins */}
            <path d="M 25 30 C 95 52, 155 78, 220 100" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M 45 38 C 105 68, 158 102, 218 125" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 75 48 C 125 88, 172 118, 216 138" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 15 48 C 38 68, 68 98, 98 112" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Lattice cross-veins */}
            <path d="M 55 42 L 45 62" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 85 48 L 75 78" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 115 58 L 105 95" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 145 68 L 135 112" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 175 80 L 165 125" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 35 50 L 95 72" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
          </g>

          {/* RIGHT FOREWING - Ultra Detailed Translucent Lattice */}
          <g filter="url(#wingGlow)">
            <path
              d="M 280 100 C 320 65, 410 35, 475 30 C 495 28, 500 42, 490 58 C 465 98, 382 148, 285 152 Z"
              fill="#ffffff"
              fillOpacity="0.08"
              stroke="#e2e8f0"
              strokeWidth="3.5"
            />
            {/* Main veins */}
            <path d="M 475 30 C 405 52, 345 78, 280 100" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M 455 38 C 395 68, 342 102, 282 125" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 425 48 C 375 88, 328 118, 284 138" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 485 48 C 462 68, 432 98, 402 112" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Lattice cross-veins */}
            <path d="M 445 42 L 455 62" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 415 48 L 425 78" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 385 58 L 395 95" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 355 68 L 365 112" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 325 80 L 335 125" stroke="#e2e8f0" strokeWidth="1" opacity="0.8" />
            <path d="M 465 50 L 405 72" stroke="#ef4444" strokeWidth="1" opacity="0.5" />
          </g>

          {/* LEFT HINDWING with Red Edge Highlight */}
          <g opacity="0.9">
            <path
              d="M 220 150 C 170 155, 75 148, 55 170 C 42 182, 58 198, 85 208 C 128 222, 195 192, 225 168 Z"
              fill="#ffffff"
              fillOpacity="0.05"
              stroke="#f87171"
              strokeWidth="2.5"
            />
            <path d="M 55 170 C 115 170, 178 162, 220 150" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 75 185 C 130 185, 188 172, 222 158" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
          </g>

          {/* RIGHT HINDWING with Red Edge Highlight */}
          <g opacity="0.9">
            <path
              d="M 280 150 C 330 155, 425 148, 445 170 C 458 182, 442 198, 415 208 C 372 222, 305 192, 275 168 Z"
              fill="#ffffff"
              fillOpacity="0.05"
              stroke="#f87171"
              strokeWidth="2.5"
            />
            <path d="M 445 170 C 385 170, 322 162, 280 150" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 425 185 C 370 185, 312 172, 278 158" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
          </g>

          {/* CICADA 3301 TEXT */}
          <text
            x="250"
            y="335"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="monospace, sans-serif"
            fontWeight="900"
            fontSize="40"
            letterSpacing="6"
            className="drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          >
            Cicada 3301
          </text>
        </svg>
      </div>

      {showText && (
        <span className="font-mono font-extrabold tracking-widest text-slate-100 text-sm uppercase">
          Cicada 3301
        </span>
      )}
    </div>
  );
};

