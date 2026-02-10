import type { UploadResponse, JobStatus, NarrativeResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadPhotos(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${err}`);
  }
  return res.json();
}

export async function createJob(
  jobId: string,
  narrative: string,
  imageOrder: string[],
  referenceIndex: number = 0
): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_id: jobId,
      narrative,
      image_order: imageOrder,
      reference_index: referenceIndex,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Job creation failed: ${err}`);
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  if (!res.ok) throw new Error("Status check failed");
  return res.json();
}

export function getVideoDownloadUrl(jobId: string): string {
  return `${API_BASE}/api/jobs/${jobId}/video`;
}

export async function generateNarrative(
  jobId: string,
  userNarrative?: string
): Promise<NarrativeResponse> {
  const res = await fetch(`${API_BASE}/api/narrative/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_id: jobId,
      user_narrative: userNarrative || null,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Narrative generation failed: ${err}`);
  }
  return res.json();
}
