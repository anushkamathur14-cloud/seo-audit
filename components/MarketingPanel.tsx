import {
  BarChart3,
  Bot,
  ListChecks,
  Megaphone,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import type { AuditResult } from "@/lib/types";
import { getAiInsightText } from "@/lib/report-insights";
import { ThemeToggle } from "./ThemeToggle";

const FEATURES = [
  { icon: Search, label: "Technical SEO Audit", color: "from-violet-500 to-indigo-600" },
  { icon: Zap, label: "Performance Analysis", color: "from-blue-500 to-cyan-500" },
  { icon: Megaphone, label: "Paid Media Strategy", color: "from-fuchsia-500 to-purple-600" },
  { icon: ListChecks, label: "Actionable Recommendations", color: "from-indigo-500 to-blue-600" },
  { icon: BarChart3, label: "Prioritized Next Steps", color: "from-purple-500 to-violet-600" },
];

interface MarketingPanelProps {
  result?: AuditResult | null;
}

export function MarketingPanel({ result }: MarketingPanelProps) {
  const insight = result
    ? getAiInsightText(result)
    : "Enter your website URL to get a consultant-style audit with prioritized SEO fixes, performance insights, and optional paid media strategy.";

  return (
    <aside className="marketing-panel flex min-h-full flex-col px-6 py-8 lg:px-8 lg:py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Bot className="h-5 w-5 text-violet-300" aria-hidden />
          </div>
          <span className="text-sm font-medium text-white/80">Strategy Agent</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        AI Powered
      </div>

      <h1 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
        AI Marketing
        <br />
        Strategy Agent
      </h1>

      <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
        Get an AI-powered SEO audit and paid media strategy in minutes.
      </p>

      <ul className="mt-10 space-y-4">
        {FEATURES.map(({ icon: Icon, label, color }) => (
          <li key={label} className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}
            >
              <Icon className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span className="text-sm font-medium text-slate-200">{label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-10">
        <div className="rounded-2xl border border-violet-500/20 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-200">
            <Sparkles className="h-4 w-4" aria-hidden />
            AI Insight
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{insight}</p>
        </div>
      </div>
    </aside>
  );
}
