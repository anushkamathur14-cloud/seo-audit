import { NextResponse } from "next/server";
import { getJob } from "@/lib/job-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || id.length < 10) {
    return NextResponse.json({ error: "Invalid job ID." }, { status: 400 });
  }

  const job = getJob(id);

  if (!job) {
    return NextResponse.json(
      {
        error:
          "Audit session not found. This can happen if the server restarted during your audit — please run a new audit.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
    url: job.url,
  });
}
