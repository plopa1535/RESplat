"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUploader from "@/components/PhotoUploader";
import AINarrativePanel from "@/components/AINarrativePanel";
import NarrativeInput from "@/components/NarrativeInput";
import GenerateButton from "@/components/GenerateButton";
import { uploadPhotos, createJob } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [narrative, setNarrative] = useState("");
  const [referenceIndex, setReferenceIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [useAI, setUseAI] = useState(true);

  const canUpload = files.length > 0 && !jobId;
  const canGenerate = narrative.trim().length > 0 && jobId;

  const handleUploadPhotos = async () => {
    if (!canUpload) return;
    setUploading(true);
    setError("");
    try {
      const uploadRes = await uploadPhotos(files);
      setJobId(uploadRes.job_id);
      setUploadedFiles(uploadRes.files);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate || !jobId) return;
    setGenerating(true);
    setError("");
    try {
      await createJob(jobId, narrative, uploadedFiles, referenceIndex);
      router.push(`/preview/${jobId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "영상 생성 실패");
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setJobId(null);
    setUploadedFiles([]);
    setNarrative("");
    setError("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">시네마틱 영상 만들기</h1>
        <p className="text-gray-400 mt-1">
          사진을 업로드하면 AI가 서사를 자동 생성합니다. 직접 서사를 추가하여 결합할 수도 있습니다.
        </p>
      </div>

      {/* Step 1: Photo Upload */}
      <PhotoUploader
        files={files}
        onChange={(newFiles) => {
          setFiles(newFiles);
          if (jobId) handleReset();
        }}
        referenceIndex={referenceIndex}
        onReferenceChange={setReferenceIndex}
      />

      {!jobId && files.length > 0 && (
        <button
          onClick={handleUploadPhotos}
          disabled={uploading || !canUpload}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              업로드 중...
            </>
          ) : (
            `📤 사진 ${files.length}장 업로드`
          )}
        </button>
      )}

      {jobId && (
        <div className="bg-green-900/20 border border-green-800/50 rounded-lg px-4 py-2.5 text-sm text-green-400 flex items-center gap-2">
          <span>✅</span>
          <span>사진 {uploadedFiles.length}장 업로드 완료</span>
          <button
            onClick={handleReset}
            className="ml-auto text-xs text-gray-400 hover:text-gray-300 underline"
          >
            다시 업로드
          </button>
        </div>
      )}

      {/* Step 2: Narrative Generation */}
      {jobId && (
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUseAI(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${useAI
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
            >
              🤖 AI 서사 생성
            </button>
            <button
              onClick={() => setUseAI(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${!useAI
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
            >
              ✍️ 직접 작성
            </button>
          </div>

          {useAI ? (
            <AINarrativePanel
              jobId={jobId}
              onNarrativeReady={setNarrative}
            />
          ) : (
            <NarrativeInput value={narrative} onChange={setNarrative} />
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Step 3: Generate Video */}
      {jobId && (
        <GenerateButton
          disabled={!canGenerate}
          loading={generating}
          onClick={handleGenerate}
        />
      )}
    </div>
  );
}
