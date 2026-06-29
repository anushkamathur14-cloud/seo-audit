import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import type { AuditJob, AuditProgress, AuditResult } from "./types";

const JOB_DIR =
  process.env.JOB_STORE_DIR ||
  path.join(os.tmpdir(), "seo-audit-jobs");

/** Persist jobs on disk so polling works across Next.js worker instances. */
const globalForJobs = globalThis as typeof globalThis & {
  seoAuditJobs?: Map<string, AuditJob>;
};

function ensureJobDir(): void {
  if (!fs.existsSync(JOB_DIR)) {
    fs.mkdirSync(JOB_DIR, { recursive: true });
  }
}

function jobFilePath(id: string): string {
  return path.join(JOB_DIR, `${id}.json`);
}

function sanitizeJobForDisk(job: AuditJob): AuditJob {
  const { openaiApiKey: _removed, ...safe } = job;
  return safe;
}

function writeJob(job: AuditJob): void {
  ensureJobDir();
  const fileJob = sanitizeJobForDisk(job);
  const secretFile = path.join(JOB_DIR, `${job.id}.secret`);
  fs.writeFileSync(jobFilePath(job.id), JSON.stringify(fileJob), "utf8");
  if (job.openaiApiKey) {
    fs.writeFileSync(secretFile, job.openaiApiKey, { mode: 0o600 });
  } else if (fs.existsSync(secretFile)) {
    fs.unlinkSync(secretFile);
  }
}

function readJobFromDisk(id: string): AuditJob | undefined {
  const file = jobFilePath(id);
  if (!fs.existsSync(file)) return undefined;
  try {
    const job = JSON.parse(fs.readFileSync(file, "utf8")) as AuditJob;
    const secretFile = path.join(JOB_DIR, `${id}.secret`);
    if (fs.existsSync(secretFile)) {
      job.openaiApiKey = fs.readFileSync(secretFile, "utf8").trim();
    }
    return job;
  } catch {
    return undefined;
  }
}

function getJobsMap(): Map<string, AuditJob> {
  if (!globalForJobs.seoAuditJobs) {
    globalForJobs.seoAuditJobs = new Map();
  }
  return globalForJobs.seoAuditJobs;
}

function clearJobSecrets(job: AuditJob): void {
  delete job.openaiApiKey;
  const secretFile = path.join(JOB_DIR, `${job.id}.secret`);
  if (fs.existsSync(secretFile)) {
    fs.unlinkSync(secretFile);
  }
}

export function createJob(
  url: string,
  totalEstimate: number,
  openaiApiKey?: string,
  includePaidMedia = false,
): AuditJob {
  const now = new Date().toISOString();
  const job: AuditJob = {
    id: uuidv4(),
    url,
    status: "running",
    progress: {
      pagesCrawled: 0,
      totalEstimate,
      phase: "crawling",
      message: "Starting crawl...",
    },
    createdAt: now,
    updatedAt: now,
    includePaidMedia,
    ...(openaiApiKey ? { openaiApiKey } : {}),
  };
  getJobsMap().set(job.id, job);
  writeJob(job);
  return job;
}

export function getJob(id: string): AuditJob | undefined {
  const cached = getJobsMap().get(id);
  if (cached) return cached;

  const fromDisk = readJobFromDisk(id);
  if (fromDisk) {
    getJobsMap().set(id, fromDisk);
    return fromDisk;
  }
  return undefined;
}

function loadMutableJob(id: string): AuditJob | undefined {
  const job = getJob(id);
  if (!job) return undefined;
  return job;
}

export function updateJobProgress(
  id: string,
  progress: Partial<AuditProgress>,
): void {
  const job = loadMutableJob(id);
  if (!job) return;
  job.progress = { ...job.progress, ...progress };
  job.updatedAt = new Date().toISOString();
  writeJob(job);
}

export function completeJob(id: string, result: AuditResult): void {
  const job = loadMutableJob(id);
  if (!job) return;
  job.status = "complete";
  job.result = result;
  job.progress.phase = "complete";
  job.progress.message = "Audit complete.";
  job.updatedAt = new Date().toISOString();
  clearJobSecrets(job);
  writeJob(job);
}

export function failJob(id: string, error: string): void {
  const job = loadMutableJob(id);
  if (!job) return;
  job.status = "error";
  job.error = error;
  job.updatedAt = new Date().toISOString();
  clearJobSecrets(job);
  writeJob(job);
}
