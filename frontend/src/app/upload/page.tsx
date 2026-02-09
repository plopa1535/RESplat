"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUploader from "@/components/PhotoUploader";
import NarrativeInput from "@/components/NarrativeInput";
import GenerateButton from "@/components/GenerateButton";
import { uploadPhotos, createJob } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [narrative, setNarrative] = useState("");
  const [referenceIndex, setReferenceIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = files.length > 0 && narrative.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError("");

    try {
      const uploadRes = await uploadPhotos(files);
      await createJob(uploadRes.job_id, narrative, uploadRes.files, referenceIndex);
      router.push(`/preview/${uploadRes.job_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create Cinematic Video</h1>
        <p className="text-gray-400 mt-1">
          Upload photos and write a narrative to generate a 10-second cinematic
          video. Select a character reference photo to preserve the subject
          across all scenes.
        </p>
      </div>

      <PhotoUploader
        files={files}
        onChange={setFiles}
        referenceIndex={referenceIndex}
        onReferenceChange={setReferenceIndex}
      />
      <NarrativeInput value={narrative} onChange={setNarrative} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <GenerateButton
        disabled={!canGenerate}
        loading={loading}
        onClick={handleGenerate}
      />
    </div>
  );
}
