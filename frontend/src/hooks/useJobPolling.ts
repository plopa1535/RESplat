"use client";

import { useState, useEffect, useRef } from "react";
import { getJobStatus } from "@/lib/api";
import type { JobStatus } from "@/lib/types";

export function useJobPolling(jobId: string | null, intervalMs = 3000) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const s = await getJobStatus(jobId);
        setStatus(s);
        if (
          (s.status === "completed" || s.status === "failed") &&
          timerRef.current
        ) {
          clearInterval(timerRef.current);
        }
      } catch {
        // retry on next interval
      }
    };

    poll();
    timerRef.current = setInterval(poll, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [jobId, intervalMs]);

  return status;
}
