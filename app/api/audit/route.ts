import { after } from "next/server";
import { NextResponse } from "next/server";
import { createJob } from "@/lib/job-store";
import { runAuditJob } from "@/lib/audit-runner";
import { config } from "@/lib/config";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function normalizeApiKey(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith("sk-")) return undefined;
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = body?.url;

    if (body?.openaiApiKey && !normalizeApiKey(body.openaiApiKey)) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key format. Keys should start with sk-." },
        { status: 400 },
      );
    }

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
    }

    const url = parsedUrl.href;
    const userProvidedKey = normalizeApiKey(body?.openaiApiKey);
    const serverKey = config.openaiApiKey;
    const job = createJob(url, config.maxPages, userProvidedKey, body?.includePaidMedia === true);

    after(async () => {
      try {
        await runAuditJob(job.id, url);
      } catch (err) {
        console.error("Background audit failed:", err);
      }
    });

    return NextResponse.json({
      jobId: job.id,
      aiEnabled: !!(userProvidedKey || serverKey),
    });
  } catch (error) {
    console.error("Failed to start audit:", error);
    return NextResponse.json(
      { error: "Failed to start audit." },
      { status: 500 },
    );
  }
}
