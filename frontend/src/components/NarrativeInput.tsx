"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function NarrativeInput({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        ✍️ 서사 직접 작성
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="사진들을 연결하는 짧은 이야기를 작성하세요. 텍스트가 자막으로 나뉘어 영상에 표시됩니다."
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
      />
      <p className="text-xs text-gray-500 mt-1">
        {value.length} characters
      </p>
    </div>
  );
}
