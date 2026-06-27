"use client";

import { useEffect, useState } from "react";

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
      // ignore storage errors
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
      // ignore storage errors
    }

    onSubmit({
      url: url.trim(),
      openaiApiKey: trimmedKey || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20"
    >
      <div>
        <label
          htmlFor="audit-url"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Website URL
        </label>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Start with your homepage, e.g. https://yourdomain.com
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="audit-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          disabled={loading}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Running audit…" : "Run audit"}
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => setShowKeyField(!showKeyField)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          <span>Optional: OpenAI API key for AI recommendations</span>
          <span className="text-zinc-400">{showKeyField ? "−" : "+"}</span>
        </button>

        {showKeyField && (
          <div className="space-y-3 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
              disabled={loading}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <p className="text-xs text-zinc-500">
              Unlocks AI SEO fixes and paid media strategy. Without a key you
              still get the full technical audit with rule-based suggestions.
              Your key is used only for this audit and is not stored on our
              servers.
            </p>
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                disabled={loading}
                className="rounded border-zinc-300"
              />
              Remember in this browser tab
            </label>
          </div>
        )}
      </div>
    </form>
  );
}
