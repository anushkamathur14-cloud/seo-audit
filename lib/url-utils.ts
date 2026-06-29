export function normalizeAuditUrl(raw: string): string {
  let value = raw.trim();
  if (!value) throw new Error("empty");

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  const parsed = new URL(value);
  parsed.hash = "";

  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }

  return parsed.href;
}

export function validateAuditUrl(raw: string): string | null {
  try {
    const url = normalizeAuditUrl(raw);
    if (!url.includes(".")) {
      return "Enter a full domain like yoursite.com or https://yoursite.com.";
    }
    return null;
  } catch {
    return "We couldn't read that URL. Check the format and try again.";
  }
}

export const EXAMPLE_AUDIT_URL = "https://stripe.com";
