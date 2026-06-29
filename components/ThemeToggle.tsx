"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-card text-foreground transition hover:border-accent/40 hover:bg-accent-soft"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-slate-600" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400" />
      )}
    </button>
  );
}
