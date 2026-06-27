import { v4 as uuidv4 } from "uuid";
import type { AuditJob, AuditProgress, AuditResult } from "./types";

const jobs = new Map<string, AuditJob>();

export function createJob(url: string, totalEstimate: number): AuditJob {
  const now = new Date().toISOString();
  const job: AuditJob = {
    id: uuidv4(),
    url,
    status: "running",
    progress: {
      pagesCrawled: 0,
      totalEstimate,
      phase: "crawling",
    },
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): AuditJob | undefined {
  return jobs.get(id);
}

export function updateJobProgress(
  id: string,
  progress: Partial<AuditProgress>,
): void {
  const job = jobs.get(id);
  if (!job) return;
  job.progress = { ...job.progress, ...progress };
  job.updatedAt = new Date().toISOString();
}

export function completeJob(id: string, result: AuditResult): void {
  const job = jobs.get(id);
  if (!job) return;
  job.status = "complete";
  job.result = result;
  job.progress.phase = "complete";
  job.updatedAt = new Date().toISOString();
}

export function failJob(id: string, error: string): void {
  const job = jobs.get(id);
  if (!job) return;
  job.status = "error";
  job.error = error;
  job.updatedAt = new Date().toISOString();
}
