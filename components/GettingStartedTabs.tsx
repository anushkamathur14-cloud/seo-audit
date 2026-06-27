"use client";

import { useState } from "react";
import { HowItWorks } from "./HowItWorks";
import { AuditLimitations } from "./AuditLimitations";

type GuideTab = "how-to" | "limits";

export function GettingStartedTabs() {
  const [tab, setTab] = useState<GuideTab>("how-to");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-950">
        <GuideTabButton
          active={tab === "how-to"}
          onClick={() => setTab("how-to")}
        >
          How to use
        </GuideTabButton>
        <GuideTabButton
          active={tab === "limits"}
          onClick={() => setTab("limits")}
        >
          Limitations
        </GuideTabButton>
      </div>
      {tab === "how-to" ? (
        <HowItWorks />
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
          <AuditLimitations embedded />
        </div>
      )}
    </div>
  );
}

function GuideTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-indigo-300"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
      }`}
    >
      {children}
    </button>
  );
}
