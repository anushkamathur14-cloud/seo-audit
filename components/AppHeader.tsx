import { SearchCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border/80 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <SearchCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold leading-tight text-foreground">
              SEO Audit Agent
            </p>
            <p className="text-xs text-muted">
              Technical SEO · Performance · Paid strategy
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
