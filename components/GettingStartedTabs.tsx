"use client";

import { useState } from "react";
import { BookOpen, Info } from "lucide-react";
import { HowItWorks } from "./HowItWorks";
import { AuditLimitations } from "./AuditLimitations";

type GuideTab = "how-to" | "limits";

export function GettingStartedTabs() {
  const [tab, setTab] = useState<GuideTab>("how-to");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl border border-card-border bg-background/60 p-1 backdrop-blur-sm">
        <GuideTabButton
          active={tab === "how-to"}
          onClick={() => setTab("how-to")}
          icon={BookOpen}
        >
          How to use
        </GuideTabButton>
        <GuideTabButton
          active={tab === "limits"}
          onClick={() => setTab("limits")}
          icon={Info}
        >
          Limitations
        </GuideTabButton>
      </div>
      {tab === "how-to" ? (
        <HowItWorks />
      ) : (
        <div className="card border-amber-200/60 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
          <AuditLimitations embedded />
        </div>
      )}
    </div>
  );
}

function GuideTabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-card text-accent shadow-sm ring-1 ring-accent/15"
          : "text-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
