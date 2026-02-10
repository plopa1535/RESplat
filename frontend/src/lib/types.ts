export interface UploadResponse {
  job_id: string;
  files: string[];
}

export interface JobStatus {
  job_id: string;
  status:
  | "queued"
  | "splitting_narrative"
  | "generating_narrative"
  | "generating_clips"
  | "compositing"
  | "burning_subtitles"
  | "completed"
  | "failed";
  progress_pct: number;
  current_step: string;
  error?: string;
}

export interface NarrativeResponse {
  ai_narrative: string;
  user_narrative: string;
  merged_narrative: string;
}
