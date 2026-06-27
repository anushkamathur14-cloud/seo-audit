import { NextResponse } from "next/server";
import { getJob } from "@/lib/job-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  });
}
