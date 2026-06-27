import { NextResponse } from "next/server";
import { createJob } from "@/lib/job-store";
import { runAuditJob } from "@/lib/audit-runner";
import { config } from "@/lib/config";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = body?.url;

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
    const job = createJob(url, config.maxPages);

    runAuditJob(job.id, url).catch((err) => {
      console.error("Background audit failed:", err);
    });

    return NextResponse.json({ jobId: job.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to start audit." },
      { status: 500 },
    );
  }
}
