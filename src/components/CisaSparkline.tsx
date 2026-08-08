import React, { useMemo } from 'react';
import { CisaAdvisory } from './CisaIcsAdvisoriesFeed';
import { get12MonthCisaCounts } from '../utils/cisaUtils';
import { TrendingUp, Activity } from 'lucide-react';

interface CisaSparklineProps {
  advisories: CisaAdvisory[];
  compact?: boolean;
}

export const CisaSparkline: React.FC<CisaSparklineProps> = ({ advisories, compact = false }) => {
  const { buckets, total12M, maxCount } = useMemo(() => {
    return get12MonthCisaCounts(advisories);
  }, [advisories]);

  // SVG dimensions
  const width = compact ? 70 : 90;
  const height = compact ? 22 : 26;
  const paddingY = 4;
  const paddingX = 4;

  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  // Calculate coordinates for points
  const points = useMemo(() => {
    const step = usableWidth / (buckets.length - 1);
    return buckets.map((b, idx) => {
      const x = paddingX + idx * step;
      // Normalizing y: height 0 at top, so higher count gives smaller y value
      const normalizedValue = total12M === 0 ? 0 : b.count / maxCount;
      const y = height - paddingY - normalizedValue * usableHeight;
      return { x, y, count: b.count, label: b.label };
    });
  }, [buckets, usableWidth, usableHeight, maxCount, total12M, height, paddingX, paddingY]);

  // Build SVG Path string
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');
  }, [points]);

  // Area Path string for filled gradient
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const bottomY = (height - paddingY).toFixed(1);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, points, height, paddingY]);

  // Tooltip text for 12M monthly distribution
  const tooltipContent = useMemo(() => {
    if (total12M === 0) return 'No CISA advisories in the last 12 months';
    const activeMonths = buckets.filter((b) => b.count > 0);
    const breakdown = activeMonths.map((b) => `${b.label}: ${b.count}`).join(' • ');
    return `${total12M} Advisory ${total12M === 1 ? 'Notice' : 'Notices'} (12M): ${breakdown}`;
  }, [total12M, buckets]);

  const sparklineId = useMemo(() => `spark-grad-${Math.random().toString(36).substring(2, 7)}`, []);

  if (total12M === 0) {
    return (
      <div
        title="0 CISA advisories recorded in last 12 months"
        className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg width={width} height={height} className="overflow-visible">
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </svg>
        <span className="font-mono text-[10px] text-slate-400">0</span>
      </div>
    );
  }

  return (
    <div
      title={tooltipContent}
      className="flex items-center gap-1.5 group/spark font-mono"
    >
      <div className="relative flex items-center justify-center">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={sparklineId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill under sparkline */}
          <path d={areaPath} fill={`url(#${sparklineId})`} />

          {/* Stroke line */}
          <path
            d={linePath}
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Data Dots */}
          {points.map(
            (p, idx) =>
              p.count > 0 && (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={compact ? 2 : 2.5}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  {p.count === maxCount && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={compact ? 4 : 5}
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="1"
                      className="animate-ping"
                    />
                  )}
                </g>
              )
          )}
        </svg>
      </div>

      {/* Count pill badge */}
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 shadow-2xs group-hover/spark:bg-red-600 group-hover/spark:text-white transition-colors">
        <TrendingUp className="w-2.5 h-2.5 text-red-600 group-hover/spark:text-white shrink-0" />
        <span>{total12M}</span>
      </span>
    </div>
  );
};
