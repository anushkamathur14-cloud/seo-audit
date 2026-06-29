"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Globe,
  KeyRound,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";

const STORAGE_KEY = "seo-audit-openai-key";

export interface AuditFormValues {
  url: string;
  openaiApiKey?: string;
}

interface UrlFormProps {
  onSubmit: (values: AuditFormValues) => void;
  loading: boolean;
}

export function UrlForm({ onSubmit, loading }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [showKeyField, setShowKeyField] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOpenaiApiKey(saved);
        setShowKeyField(true);
        setRememberKey(true);
      }
    } catch {
      // ignore
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    const trimmedKey = openaiApiKey.trim();

    try {
      if (rememberKey && trimmedKey) {
        sessionStorage.setItem(STORAGE_KEY, trimmedKey);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }

    onSubmit({
      url: url.trim(),
      openaiApiKey: trimmedKey || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card w-full max-w-2xl animate-fade-in-up p-6 ring-1 ring-indigo-500/10"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
          <Globe className="h-5 w-5 text-accent" />
        </div>
        <div>
          <label
            htmlFor="audit-url"
            className="block font-medium text-foreground"
          >
            Website URL
          </label>
          <p className="mt-0.5 text-sm text-muted">
            Paste your homepage — we&apos;ll crawl up to 50 pages on the same
            domain.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="audit-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourdomain.com"
          required
          disabled={loading}
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run audit
            </>
          )}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-card-border">
        <button
          type="button"
          onClick={() => setShowKeyField(!showKeyField)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-accent-soft/50"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Optional: AI recommendations
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted transition ${showKeyField ? "rotate-180" : ""}`}
          />
        </button>

        {showKeyField && (
          <div className="space-y-3 border-t border-card-border bg-accent-soft/30 px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <KeyRound className="h-4 w-4 shrink-0" />
              <span>OpenAI API key (starts with sk-)</span>
            </div>
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
              disabled={loading}
              className="input-field text-sm"
            />
            <p className="text-xs leading-relaxed text-muted">
              Unlocks AI-written SEO fixes and paid media strategy. Without a
              key you still get the full technical audit. Your key is never
              stored on our servers.
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                disabled={loading}
                className="rounded border-card-border accent-indigo-600"
              />
              Remember in this browser tab
            </label>
          </div>
        )}
      </div>
    </form>
  );
}
