'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/shared/Button';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthlyRow {
  month: string;       // "2024-03"
  event_type: string;
  count: number;
}

interface TopPreset {
  presetId: string;
  presetName?: string;
  count: number;
}

interface AnalyticsData {
  summary: { page_view: number; sanitize: number; feedback: number };
  monthly: MonthlyRow[];
  topPresets: TopPreset[];
  avgCharCount: number;
  range: string;
}

type Range = '30d' | '6m' | '12m';
type EventType = 'page_view' | 'sanitize' | 'feedback';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPeriod(period: string): string {
  const parts = period.split('-');
  if (parts.length === 3) {
    // Daily format: YYYY-MM-DD
    const [y, m, d] = parts;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  // Monthly format: YYYY-MM
  const [y, m] = parts;
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────────
interface LineChartProps {
  months: string[];
  series: { label: string; color: string; values: number[] }[];
  height?: number;
}

function LineChart({ months, series, height = 180 }: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const W = 600;
  const H = height;
  const PADDING = { top: 24, right: 20, bottom: 36, left: 52 };
  const chartW = W - PADDING.left - PADDING.right;
  const chartH = H - PADDING.top - PADDING.bottom;

  const allValues = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;

  // Map helpers
  const xPos = (i: number) =>
    PADDING.left + (months.length <= 1 ? chartW / 2 : (i / (months.length - 1)) * chartW);
  const yPos = (v: number) =>
    PADDING.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  // Grid lines
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const v = Math.round((maxVal / gridCount) * i);
    const y = yPos(v);
    return { v, y };
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (months.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;

    const index = Math.max(
      0,
      Math.min(
        months.length - 1,
        Math.round(((x - PADDING.left) / chartW) * (months.length - 1))
      )
    );

    setHoveredIndex(index);

    const tooltipWidth = 140;
    const tooltipHeight = 24 + series.length * 18;
    const tooltipX = xPos(index) + 12 > W - (tooltipWidth + 10) ? xPos(index) - (tooltipWidth + 12) : xPos(index) + 12;
    const tooltipY = Math.max(10, Math.min(H - (tooltipHeight + 10), y - (tooltipHeight / 2)));
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full cursor-crosshair select-none"
      style={{ maxHeight: height }}
      aria-hidden="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid lines */}
      {gridLines.map(({ v, y }, i) => (
        <g key={i}>
          <line
            x1={PADDING.left}
            x2={W - PADDING.right}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
          <text
            x={PADDING.left - 8}
            y={y + 4}
            textAnchor="end"
            fontSize="11"
            fill="currentColor"
            opacity="0.75"
          >
            {formatNum(v)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {months.map((m, i) => {
        const isDaily = m.split('-').length === 3;
        if (isDaily) {
          // If there are 30 days, we only show every 5th label and the last label, to keep it clean.
          if (i % 5 !== 0 && i !== months.length - 1) return null;
        } else {
          // Monthly view: skip every second label if there are more than 6 months
          if (months.length > 6 && i % 2 !== 0) return null;
        }
        return (
          <text
            key={m}
            x={xPos(i)}
            y={H - 4}
            textAnchor="middle"
            fontSize="11"
            fill="currentColor"
            opacity="0.75"
          >
            {formatPeriod(m)}
          </text>
        );
      })}

      {/* Vertical Hover Tracking Line */}
      {hoveredIndex !== null && (
        <line
          x1={xPos(hoveredIndex)}
          x2={xPos(hoveredIndex)}
          y1={PADDING.top}
          y2={PADDING.top + chartH}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      )}

      {/* Series */}
      {series.map((s) => {
        const points = s.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
        const areaPoints =
          `${xPos(0)},${PADDING.top + chartH} ` +
          s.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ') +
          ` ${xPos(s.values.length - 1)},${PADDING.top + chartH}`;

        return (
          <g key={s.label}>
            {/* Area fill */}
            <polygon points={areaPoints} fill={s.color} fillOpacity="0.12" />
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={s.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {s.values.map((v, i) => (
              <circle
                key={i}
                cx={xPos(i)}
                cy={yPos(v)}
                r="4.5"
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth="1.5"
                fillOpacity={hoveredIndex === i ? 0 : 1}
                style={{ transition: 'opacity 0.15s ease' }}
              />
            ))}
            {/* Hover indicator dot */}
            {hoveredIndex !== null && (
              <circle
                cx={xPos(hoveredIndex)}
                cy={yPos(s.values[hoveredIndex])}
                r="6.5"
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}
              />
            )}
          </g>
        );
      })}

      {/* Tooltip box */}
      {hoveredIndex !== null && tooltipPos && (
        <g style={{ transition: 'transform 0.08s ease-out' }}>
          {/* Background Card */}
          <rect
            x={tooltipPos.x}
            y={tooltipPos.y}
            width="140"
            height={24 + series.length * 18}
            rx="8"
            fill="var(--color-base-100)"
            stroke="var(--border)"
            strokeWidth="1.5"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.12))',
              transition: 'x 0.08s ease-out, y 0.08s ease-out'
            }}
            className="fill-base-100 stroke-base-300"
          />
          {/* Period Title */}
          <text
            x={tooltipPos.x + 12}
            y={tooltipPos.y + 16}
            fontSize="10"
            fontWeight="bold"
            className="fill-base-content"
            opacity="0.5"
            style={{ transition: 'x 0.08s ease-out, y 0.08s ease-out' }}
          >
            {formatPeriod(months[hoveredIndex])}
          </text>
          {/* Series values */}
          {series.map((s, idx) => (
            <g key={s.label}>
              <circle
                cx={tooltipPos.x + 16}
                cy={tooltipPos.y + 30 + idx * 16}
                r="3"
                fill={s.color}
                style={{ transition: 'cx 0.08s ease-out, cy 0.08s ease-out' }}
              />
              <text
                x={tooltipPos.x + 24}
                y={tooltipPos.y + 33 + idx * 16}
                fontSize="11"
                fontWeight="semibold"
                className="fill-base-content"
                style={{ transition: 'x 0.08s ease-out, y 0.08s ease-out' }}
              >
                {`${formatNum(s.values[hoveredIndex])} ${s.label}`}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-200">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}18` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-base-content">{formatNum(value)}</p>
        <p className="text-xs text-base-content/50 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState<Range>('12m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (r: Range) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics?range=${r}`);
      if (!res.ok) throw new Error('Failed to load analytics');
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  // ── Build chart data ────────────────────────────────────────────────────────
  const { months, pageViewSeries, sanitizeSeries, feedbackSeries } = useMemo(() => {
    if (!data) return { months: [], pageViewSeries: [], sanitizeSeries: [], feedbackSeries: [] };

    const monthSet = new Set<string>();
    data.monthly.forEach((r) => monthSet.add(r.month));
    const months = Array.from(monthSet).sort();

    const getValues = (type: EventType) =>
      months.map((m) => {
        const row = data.monthly.find((r) => r.month === m && r.event_type === type);
        return row?.count ?? 0;
      });

    return {
      months,
      pageViewSeries: [{ label: 'Page Views', color: '#004AAD', values: getValues('page_view') }],
      sanitizeSeries: [{ label: 'Sanitizations', color: '#10b981', values: getValues('sanitize') }],
      feedbackSeries: [{ label: 'Feedbacks', color: '#f59e0b', values: getValues('feedback') }],
    };
  }, [data]);

  const RANGE_OPTIONS: { value: Range; label: string }[] = [
    { value: '30d', label: 'Last 30 Days' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '12m', label: 'Last 12 Months' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-base-content/40">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p className="text-sm">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-error/60"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p className="text-sm text-error">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchData(range)}>Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-7">
      {/* Range filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-base-content/60">
          Analytics for: <span className="font-semibold text-base-content">{RANGE_OPTIONS.find((o) => o.value === range)?.label}</span>
        </p>
        <div className="flex rounded-lg border border-base-300 bg-base-200/50 p-1 gap-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                range === opt.value
                  ? 'bg-base-100 text-base-content shadow-sm'
                  : 'text-base-content/50 hover:text-base-content'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Page Views"
          value={data.summary.page_view}
          color="#004AAD"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          }
        />
        <StatCard
          label="Sanitizations"
          value={data.summary.sanitize}
          color="#10b981"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          }
        />
        <StatCard
          label="Feedbacks"
          value={data.summary.feedback}
          color="#f59e0b"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5">
        {/* Page views chart */}
        <div className="rounded-xl border border-base-300 bg-base-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ background: '#004AAD' }} />
            <h3 className="text-sm font-semibold text-base-content">Page Views Over Time</h3>
          </div>
          {months.length > 0 ? (
            <LineChart months={months} series={pageViewSeries} height={200} />
          ) : (
            <div className="h-52 flex items-center justify-center text-xs text-base-content/30">No data for this period</div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Sanitizations chart */}
          <div className="rounded-xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: '#10b981' }} />
              <h3 className="text-sm font-semibold text-base-content">Sanitizations</h3>
            </div>
             {months.length > 0 ? (
              <LineChart months={months} series={sanitizeSeries} height={180} />
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-base-content/30">No data</div>
            )}
          </div>

          {/* Feedbacks chart */}
          <div className="rounded-xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: '#f59e0b' }} />
              <h3 className="text-sm font-semibold text-base-content">Feedbacks</h3>
            </div>
             {months.length > 0 ? (
              <LineChart months={months} series={feedbackSeries} height={180} />
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-base-content/30">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Top presets */}
        <div className="rounded-xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-sm font-semibold text-base-content mb-4">Top Presets Used</h3>
          {data.topPresets.length === 0 ? (
            <p className="text-xs text-base-content/30 py-4 text-center">No preset usage data yet</p>
          ) : (
            <div className="space-y-2">
              {data.topPresets.map((p, i) => {
                const maxCount = data.topPresets[0].count;
                const pct = maxCount > 0 ? (p.count / maxCount) * 100 : 0;
                return (
                  <div key={p.presetId} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-mono text-base-content/30 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-base-content truncate">{p.presetName || p.presetId}</span>
                        <span className="text-xs font-mono text-base-content/60 shrink-0 ml-2">{formatNum(p.count)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-base-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Usage metrics */}
        <div className="rounded-xl border border-base-300 bg-base-100 p-5">
          <h3 className="text-sm font-semibold text-base-content mb-4">Usage Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-base-200">
              <span className="text-xs text-base-content/60">Avg. sanitized text length</span>
              <span className="text-sm font-bold font-mono text-base-content">{data.avgCharCount} chars</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-base-200">
              <span className="text-xs text-base-content/60">Sanitize / Page view ratio</span>
              <span className="text-sm font-bold font-mono text-base-content">
                {data.summary.page_view > 0
                  ? `${((data.summary.sanitize / data.summary.page_view) * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-base-200">
              <span className="text-xs text-base-content/60">Feedback / Sanitize ratio</span>
              <span className="text-sm font-bold font-mono text-base-content">
                {data.summary.sanitize > 0
                  ? `${((data.summary.feedback / data.summary.sanitize) * 100).toFixed(2)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-base-content/60">Unique presets tracked</span>
              <span className="text-sm font-bold font-mono text-base-content">{data.topPresets.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
