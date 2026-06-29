import { Clock, FileSearch, ShieldCheck, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="animate-fade-in-up text-center lg:text-left">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-card-border bg-card/80 px-3 py-1 text-xs font-medium text-muted backdrop-blur-sm">
        <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
        No signup required · Results in 2–5 minutes
      </p>

      <h1 className="bg-gradient-to-br from-foreground via-foreground to-muted bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        Get an AI-powered SEO &amp; Growth Audit in under 5 minutes
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
        Prioritized SEO, paid media, and technical recommendations tailored to
        your website — so you know exactly what to fix first.
      </p>

      <ul className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2 lg:mx-0 lg:justify-start">
        {[
          { icon: ShieldCheck, label: "Free technical crawl" },
          { icon: Clock, label: "2–5 min average" },
          { icon: FileSearch, label: "Actionable report" },
        ].map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft/60 px-3 py-1.5 text-xs font-medium text-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
