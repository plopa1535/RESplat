"use client";

import { use } from "react";
import { useJobPolling } from "@/hooks/useJobPolling";
import ProgressTracker from "@/components/ProgressTracker";
import VideoPlayer from "@/components/VideoPlayer";
import DownloadButton from "@/components/DownloadButton";
import { getVideoDownloadUrl } from "@/lib/api";

export default function PreviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const status = useJobPolling(jobId);

  if (!status) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading...
      </div>
    );
  }

  const videoUrl = getVideoDownloadUrl(jobId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Video Preview</h1>
        <p className="text-gray-400 mt-1">Job: {jobId}</p>
      </div>

      {status.status !== "completed" && status.status !== "failed" && (
        <ProgressTracker status={status} />
      )}

      {status.status === "completed" && (
        <div className="space-y-6">
          <VideoPlayer src={videoUrl} />
          <div className="flex gap-4">
            <DownloadButton url={videoUrl} />
            <a
              href="/upload"
              className="py-3 px-6 border border-gray-600 hover:border-gray-400 text-gray-300 rounded-lg transition-colors"
            >
              Create Another
            </a>
          </div>
        </div>
      )}

      {status.status === "failed" && (
        <div className="space-y-4">
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 font-medium">Generation Failed</p>
            {status.error && (
              <p className="text-red-300 text-sm mt-1">{status.error}</p>
            )}
          </div>
          <a
            href="/upload"
            className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </a>
        </div>
      )}
    </div>
  );
}
