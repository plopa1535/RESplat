"use client";

import { useState } from "react";

interface Props {
    jobId: string;
    onNarrativeReady: (narrative: string) => void;
}

export default function AINarrativePanel({ jobId, onNarrativeReady }: Props) {
    const [aiNarrative, setAiNarrative] = useState("");
    const [userNarrative, setUserNarrative] = useState("");
    const [mergedNarrative, setMergedNarrative] = useState("");
    const [loading, setLoading] = useState(false);
    const [merging, setMerging] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState<"idle" | "ai_done" | "merged">("idle");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const handleGenerateAI = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/narrative/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId }),
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }
            const data = await res.json();
            setAiNarrative(data.ai_narrative);
            setMergedNarrative(data.merged_narrative);
            setStep("ai_done");
            onNarrativeReady(data.merged_narrative);
        } catch (e) {
            setError(e instanceof Error ? e.message : "AI 서사 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleMerge = async () => {
        if (!userNarrative.trim()) return;
        setMerging(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/narrative/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    job_id: jobId,
                    user_narrative: userNarrative,
                }),
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err);
            }
            const data = await res.json();
            setAiNarrative(data.ai_narrative);
            setMergedNarrative(data.merged_narrative);
            setStep("merged");
            onNarrativeReady(data.merged_narrative);
        } catch (e) {
            setError(e instanceof Error ? e.message : "서사 결합 실패");
        } finally {
            setMerging(false);
        }
    };

    const handleEditMerged = (val: string) => {
        setMergedNarrative(val);
        onNarrativeReady(val);
    };

    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    🤖 AI 서사 생성
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    업로드된 이미지를 AI가 분석하여 시네마틱 서사를 자동으로 생성합니다.
                </p>
                <button
                    onClick={handleGenerateAI}
                    disabled={loading}
                    className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            이미지 분석 중...
                        </>
                    ) : step === "idle" ? (
                        "✨ AI로 서사 생성하기"
                    ) : (
                        "🔄 AI 서사 다시 생성"
                    )}
                </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {aiNarrative && (
                <div className="bg-gray-900 border border-purple-800/50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-purple-400 mb-2">
                        🤖 AI가 생성한 서사
                    </label>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {aiNarrative}
                    </p>
                </div>
            )}

            {step !== "idle" && (
                <div className="border-t border-gray-800 pt-5 space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                        ✍️ 나만의 서사 추가 (선택)
                    </label>
                    <p className="text-xs text-gray-500">
                        직접 서사를 작성하면 AI 서사와 결합하여 새로운 서사를 만듭니다.
                    </p>
                    <textarea
                        value={userNarrative}
                        onChange={(e) => setUserNarrative(e.target.value)}
                        rows={3}
                        placeholder="예: 모나코의 따스한 햇살 아래, 잊지 못할 하루가 시작되었다..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                    <button
                        onClick={handleMerge}
                        disabled={merging || !userNarrative.trim()}
                        className="w-full py-2.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {merging ? (
                            <>
                                <svg
                                    className="animate-spin h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                서사 결합 중...
                            </>
                        ) : (
                            "🔀 서사 결합하기"
                        )}
                    </button>
                </div>
            )}

            {mergedNarrative && (
                <div className="bg-gray-900 border border-green-800/50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-green-400 mb-2">
                        ✅ 최종 서사 {step === "merged" ? "(AI + 나의 서사 결합)" : "(AI 생성)"}
                    </label>
                    <textarea
                        value={mergedNarrative}
                        onChange={(e) => handleEditMerged(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-green-500 resize-none text-sm leading-relaxed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        직접 수정할 수 있습니다. 이 서사가 영상에 사용됩니다.
                    </p>
                </div>
            )}
        </div>
    );
}
