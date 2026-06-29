"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface ScoreRingLargeProps {
  score: number;
  label: string;
  sublabel?: string;
}

export function ScoreRingLarge({ score, label, sublabel }: ScoreRingLargeProps) {
  const animated = useCountUp(score);
  const color =
    score >= 80
      ? "text-emerald-500"
      : score >= 60
        ? "text-amber-500"
        : "text-red-500";
  const stroke =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold tabular-nums ${color}`}>
            {animated}
          </span>
          <span className="text-xs text-muted">/100</span>
        </div>
      </div>
      <p className="mt-3 font-semibold text-foreground">{label}</p>
      {sublabel && <p className="text-xs text-muted">{sublabel}</p>}
    </div>
  );
}
