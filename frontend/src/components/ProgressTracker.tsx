"use client";

import type { JobStatus } from "@/lib/types";

interface Props {
  status: JobStatus;
}

const STEP_LABELS: Record<string, string> = {
  queued: "Waiting...",
  splitting_narrative: "Analyzing narrative...",
  generating_clips: "Generating video clips (this may take a few minutes)...",
  compositing: "Compositing clips...",
  burning_subtitles: "Adding subtitles...",
  completed: "Done!",
  failed: "Failed",
};

export default function ProgressTracker({ status }: Props) {
  const label = STEP_LABELS[status.status] || status.current_step;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500">{status.progress_pct}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${status.progress_pct}%` }}
        />
      </div>
      {status.current_step && (
        <p className="text-xs text-gray-500">{status.current_step}</p>
      )}
      {status.error && (
        <p className="text-sm text-red-400 mt-2">Error: {status.error}</p>
      )}
    </div>
  );
}
