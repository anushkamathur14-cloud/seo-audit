"use client";

interface TrafficImpactChartProps {
  currentScore: number;
}

export function TrafficImpactChart({ currentScore }: TrafficImpactChartProps) {
  const lift = Math.min(52, Math.max(12, Math.round((100 - currentScore) * 0.45)));
  const points = [
    { label: "Now", current: 100, potential: 100 },
    { label: "+1 Mo", current: 100, potential: 100 + lift * 0.25 },
    { label: "+3 Mo", current: 100, potential: 100 + lift * 0.6 },
    { label: "+6 Mo", current: 100, potential: 100 + lift },
  ];

  const max = 120 + lift * 0.2;
  const width = 320;
  const height = 140;
  const pad = { l: 8, r: 8, t: 12, b: 28 };
  const chartW = width - pad.l - pad.r;
  const chartH = height - pad.t - pad.b;

  const x = (i: number) => pad.l + (i / (points.length - 1)) * chartW;
  const y = (v: number) => pad.t + chartH - ((v - 80) / (max - 80)) * chartH;

  const currentPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.current)}`).join(" ");
  const potentialPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.potential)}`).join(" ");

  return (
    <div className="dashboard-card p-5">
      <h3 className="font-semibold text-slate-900 dark:text-white">
        Estimated Traffic Impact
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Illustrative projection if high-impact fixes are implemented
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 w-full max-w-md"
        role="img"
        aria-label="Traffic projection chart"
      >
        <path d={currentPath} fill="none" stroke="#94a3b8" strokeWidth="2.5" />
        <path
          d={potentialPath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        {points.map((p, i) => (
          <g key={p.label}>
            <circle cx={x(i)} cy={y(p.potential)} r="4" fill="#8b5cf6" />
            <text
              x={x(i)}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-3 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-slate-400" /> Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-violet-500" />{" "}
          Potential
        </span>
      </div>
    </div>
  );
}
