"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  Megaphone,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  EXAMPLE_AUDIT_URL,
  normalizeAuditUrl,
  validateAuditUrl,
} from "@/lib/url-utils";

const STORAGE_KEY = "seo-audit-openai-key";

export interface AuditFormValues {
  url: string;
  openaiApiKey?: string;
  includePaidMedia: boolean;
}

interface UrlFormProps {
  onSubmit: (values: AuditFormValues) => void;
  loading: boolean;
  compact?: boolean;
  onViewSample?: () => void;
  initialUrl?: string;
}

export function UrlForm({
  onSubmit,
  loading,
  compact = false,
  onViewSample,
  initialUrl = "",
}: UrlFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [includePaidMedia, setIncludePaidMedia] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  const [showKeyField, setShowKeyField] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setOpenaiApiKey(saved);
        setShowKeyField(true);
        setShowAddons(true);
        setRememberKey(true);
      }
    } catch {
      // ignore
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateAuditUrl(url);
    if (validationError) {
      setUrlError(validationError);
      return;
    }

    setUrlError(null);
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
      url: normalizeAuditUrl(url),
      openaiApiKey: trimmedKey || undefined,
      includePaidMedia,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`card w-full animate-fade-in-up ring-1 ring-indigo-500/10 ${compact ? "p-4" : "p-6"}`}
      aria-label="Start SEO audit"
    >
      {!compact && (
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
            <Globe className="h-5 w-5 text-accent" aria-hidden />
          </div>
          <div>
            <label htmlFor="audit-url" className="block font-medium text-foreground">
              Enter your website URL
            </label>
            <p className="mt-0.5 text-sm text-muted">
              We auto-add https:// — just paste your domain or full URL.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <input
            id="audit-url"
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (pasted && !urlError) {
                requestAnimationFrame(() => setUrl(pasted.trim()));
              }
            }}
            placeholder="yoursite.com"
            required
            disabled={loading}
            aria-invalid={!!urlError}
            aria-describedby={urlError ? "audit-url-error" : "audit-url-hint"}
            className={`input-field ${urlError ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
          />
          {urlError ? (
            <p id="audit-url-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {urlError}
            </p>
          ) : (
            <p id="audit-url-hint" className="mt-2 text-xs text-muted">
              Example: stripe.com or https://www.yoursite.com
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-primary shrink-0 sm:min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Running…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" aria-hidden />
              Run free audit
            </>
          )}
        </button>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setUrl(EXAMPLE_AUDIT_URL);
              setUrlError(null);
            }}
            className="font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Try example URL
          </button>
          {onViewSample && (
            <>
              <span className="text-muted" aria-hidden>
                ·
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={onViewSample}
                className="inline-flex items-center gap-1 font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                View sample report
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </button>
            </>
          )}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-card-border">
        <button
          type="button"
          onClick={() => setShowAddons(!showAddons)}
          aria-expanded={showAddons}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-accent-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
        >
          <span>Customize audit (optional)</span>
          <ChevronDown
            className={`h-4 w-4 text-muted transition ${showAddons ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {showAddons && (
          <div className="space-y-4 border-t border-card-border bg-accent-soft/20 px-4 py-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={includePaidMedia}
                onChange={(e) => setIncludePaidMedia(e.target.checked)}
                disabled={loading}
                className="mt-0.5 rounded border-card-border accent-indigo-600"
              />
              <span>
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Megaphone className="h-4 w-4 text-accent" aria-hidden />
                  Include paid media strategy
                </span>
                <span className="mt-1 block text-sm text-muted">
                  Keyword targets, channels, budget guidance, and a 12-week
                  launch timeline.
                </span>
              </span>
            </label>

            <div className="rounded-lg border border-card-border bg-card">
              <button
                type="button"
                onClick={() => setShowKeyField(!showKeyField)}
                aria-expanded={showKeyField}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-medium text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                  AI-written recommendations
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition ${showKeyField ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {showKeyField && (
                <div className="space-y-3 border-t border-card-border px-3 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
                    OpenAI API key (starts with sk-)
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
                    Optional — unlocks consultant-style SEO fixes
                    {includePaidMedia ? " and paid media strategy" : ""}. Your
                    key is never stored on our servers.
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
          </div>
        )}
      </div>
    </form>
  );
}
