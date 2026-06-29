import {
  BookOpen,
  ClipboardList,
  Download,
  KeyRound,
  Link2,
  ListChecks,
} from "lucide-react";
import { HOW_TO_STEPS } from "@/lib/audit-guide";

const STEP_ICONS = [Link2, KeyRound, ListChecks, ClipboardList, Download];

export function HowItWorks() {
  return (
    <section className="card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft">
          <BookOpen className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            How to use this tool
          </h2>
          <p className="text-sm text-muted">
            Five steps from URL to actionable report
          </p>
        </div>
      </div>

      <ol className="mt-6 space-y-4">
        {HOW_TO_STEPS.map((item, index) => {
          const Icon = STEP_ICONS[index] ?? ListChecks;
          return (
            <li
              key={item.step}
              className="flex gap-4 rounded-xl p-3 transition hover:bg-accent-soft/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Step {item.step}
                  </span>
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
