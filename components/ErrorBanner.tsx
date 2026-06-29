import { AlertCircle } from "lucide-react";
import { toFriendlyError } from "@/lib/error-messages";

interface ErrorBannerProps {
  error: string;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  const friendly = toFriendlyError(error);

  return (
    <div
      className="card border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
        <div>
          <p className="font-medium text-red-900 dark:text-red-200">
            {friendly.title}
          </p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">
            {friendly.message}
          </p>
          {friendly.reasons && friendly.reasons.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700 dark:text-red-400">
                Possible reasons
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-300">
                {friendly.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2">
                    <span aria-hidden>•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
