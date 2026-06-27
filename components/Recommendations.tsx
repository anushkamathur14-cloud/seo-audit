"use client";

import { useState } from "react";
import type { Recommendation } from "@/lib/types";

interface RecommendationsProps {
  recommendations: Recommendation[];
  aiGenerated: boolean;
}

export function Recommendations({
  recommendations,
  aiGenerated,
}: RecommendationsProps) {
  const [expanded, setExpanded] = useState<string | null>(
    recommendations[0]?.id ?? null,
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Recommendations
          </h2>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {aiGenerated ? "AI-generated" : "Rule-based"}
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {recommendations.map((rec) => (
          <div key={rec.id}>
            <button
              onClick={() =>
                setExpanded(expanded === rec.id ? null : rec.id)
              }
              className="flex w-full items-start gap-3 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-950"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  rec.impact === "quick-win"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                }`}
              >
                {rec.impact === "quick-win" ? "Quick win" : "Long-term"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {rec.title}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {rec.description}
                </p>
              </div>
              <span className="text-zinc-400">
                {expanded === rec.id ? "−" : "+"}
              </span>
            </button>

            {expanded === rec.id && (
              <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  How to fix
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {rec.fixInstructions}
                </p>
                <p className="mt-3 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    SEO impact:{" "}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {rec.estimatedSeoImpact}
                  </span>
                </p>
                {rec.affectedPages && rec.affectedPages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Affected pages
                    </p>
                    <ul className="mt-1 space-y-1">
                      {rec.affectedPages.map((page) => (
                        <li key={page}>
                          <a
                            href={page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {page}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
