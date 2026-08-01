import React from 'react';

interface Cicada3301LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Cicada3301Logo: React.FC<Cicada3301LogoProps> = ({
  className = "w-8 h-8",
  size = 32,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
      >
        {/* Cicada Body - Head & Eyes */}
        <circle cx="250" cy="90" r="18" fill="currentColor" opacity="0.9" />
        <circle cx="225" cy="90" r="10" fill="currentColor" />
        <circle cx="275" cy="90" r="10" fill="currentColor" />
        {/* Ocelli eyes */}
        <circle cx="243" cy="80" r="3" fill="#ffffff" />
        <circle cx="250" cy="78" r="3" fill="#ffffff" />
        <circle cx="257" cy="80" r="3" fill="#ffffff" />

        {/* Antennae */}
        <path d="M 235 80 L 210 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M 265 80 L 290 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

        {/* Thorax */}
        <path
          d="M 220 100 C 220 100, 250 110, 280 100 C 290 120, 285 145, 280 155 C 250 165, 220 155, 220 155 C 215 145, 210 120, 220 100 Z"
          fill="currentColor"
          opacity="0.85"
          stroke="currentColor"
          strokeWidth="3"
        />
        {/* Mesothorax details */}
        <path d="M 235 110 L 250 140 L 265 110" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* Abdomen Segments */}
        <path
          d="M 222 158 C 235 162, 265 162, 278 158 L 274 180 C 260 184, 240 184, 226 180 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M 226 182 C 238 186, 262 186, 274 182 L 270 204 C 258 208, 242 208, 230 204 Z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M 230 206 C 240 210, 260 210, 270 206 L 265 228 C 255 232, 245 232, 235 228 Z"
          fill="currentColor"
          opacity="0.75"
        />
        <path
          d="M 235 230 C 242 233, 258 233, 265 230 L 258 255 C 253 258, 247 258, 242 255 Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path d="M 242 257 L 250 280 L 258 257 Z" fill="currentColor" />

        {/* Legs */}
        <path d="M 215 115 L 180 125 L 160 150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 285 115 L 320 125 L 340 150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 218 140 L 175 160 L 155 190" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 282 140 L 325 160 L 345 190" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 225 165 L 190 200 L 175 235" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 275 165 L 310 200 L 325 235" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* LEFT FOREWING */}
        <g opacity="0.95">
          <path
            d="M 220 100 C 180 70, 90 40, 30 35 C 10 33, 5 45, 15 60 C 40 95, 120 145, 215 150 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="4"
          />
          {/* Main veins left forewing */}
          <path d="M 30 35 C 100 55, 160 80, 220 100" stroke="currentColor" strokeWidth="3" />
          <path d="M 50 42 C 110 70, 160 105, 218 125" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 80 52 C 130 90, 175 120, 216 138" stroke="currentColor" strokeWidth="2" />
          <path d="M 20 50 C 40 70, 70 100, 100 115" stroke="currentColor" strokeWidth="1.5" />
          {/* Cross veins */}
          <path d="M 60 45 L 50 65" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 90 52 L 80 82" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 120 60 L 110 98" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 150 72 L 140 115" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 180 85 L 170 130" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        </g>

        {/* RIGHT FOREWING */}
        <g opacity="0.95">
          <path
            d="M 280 100 C 320 70, 410 40, 470 35 C 490 33, 495 45, 485 60 C 460 95, 380 145, 285 150 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="4"
          />
          {/* Main veins right forewing */}
          <path d="M 470 35 C 400 55, 340 80, 280 100" stroke="currentColor" strokeWidth="3" />
          <path d="M 450 42 C 390 70, 340 105, 282 125" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 420 52 C 370 90, 325 120, 284 138" stroke="currentColor" strokeWidth="2" />
          <path d="M 480 50 C 460 70, 430 100, 400 115" stroke="currentColor" strokeWidth="1.5" />
          {/* Cross veins */}
          <path d="M 440 45 L 450 65" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 410 52 L 420 82" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 380 60 L 390 98" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 350 72 L 360 115" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <path d="M 320 85 L 330 130" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        </g>

        {/* LEFT HINDWING */}
        <g opacity="0.85">
          <path
            d="M 220 150 C 170 155, 80 150, 60 170 C 50 180, 65 195, 90 205 C 130 220, 195 190, 225 168 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path d="M 60 170 C 120 170, 180 162, 220 150" stroke="currentColor" strokeWidth="2" />
          <path d="M 80 185 C 135 185, 190 172, 222 158" stroke="currentColor" strokeWidth="1.5" />
        </g>

        {/* RIGHT HINDWING */}
        <g opacity="0.85">
          <path
            d="M 280 150 C 330 155, 420 150, 440 170 C 450 180, 435 195, 410 205 C 370 220, 305 190, 275 168 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path d="M 440 170 C 380 170, 320 162, 280 150" stroke="currentColor" strokeWidth="2" />
          <path d="M 420 185 C 365 185, 310 172, 278 158" stroke="currentColor" strokeWidth="1.5" />
        </g>

        {/* CICADA 3301 TEXT */}
        <text
          x="250"
          y="330"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="monospace, sans-serif"
          fontWeight="bold"
          fontSize="42"
          letterSpacing="4"
        >
          Cicada 3301
        </text>
      </svg>

      {showText && (
        <span className="font-mono font-extrabold tracking-widest text-slate-100 text-sm uppercase">
          Cicada 3301
        </span>
      )}
    </div>
  );
};
