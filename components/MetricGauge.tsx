"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface MetricGaugeProps {
  score: number;
  label: string;
  status: string;
  delta?: string;
  accent?: "violet" | "blue" | "emerald";
}

export function MetricGauge({
  score,
  label,
  status,
  delta,
  accent = "violet",
}: MetricGaugeProps) {
  const animated = useCountUp(score);
  const strokeColors = {
    violet: "#8b5cf6",
    blue: "#3b82f6",
    emerald: "#10b981",
  };
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="dashboard-card flex flex-col items-center p-5 text-center">
      <p className="mb-3 w-full text-left text-sm font-medium text-slate-600 dark:text-slate-400">
        {label}
      </p>
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88" aria-hidden>
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke={strokeColors[accent]}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {animated}
          </span>
          <span className="text-[10px] text-slate-500">/100</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
        {status}
      </p>
      {delta && (
        <p className="mt-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {delta}
        </p>
      )}
    </div>
  );
}
