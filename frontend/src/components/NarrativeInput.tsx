"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function NarrativeInput({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Narrative
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Write a short story that connects your photos. The text will be split across your images as subtitles."
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
      />
      <p className="text-xs text-gray-500 mt-1">
        {value.length} characters
      </p>
    </div>
  );
}
