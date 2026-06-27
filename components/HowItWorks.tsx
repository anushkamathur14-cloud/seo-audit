import { HOW_TO_STEPS } from "@/lib/audit-guide";

export function HowItWorks() {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        How to use this tool
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Five steps from URL to actionable SEO report.
      </p>

      <ol className="mt-6 space-y-5">
        {HOW_TO_STEPS.map((item) => (
          <li key={item.step} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {item.step}
            </span>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
