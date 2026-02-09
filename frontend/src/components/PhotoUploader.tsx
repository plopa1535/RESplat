"use client";

import { useRef } from "react";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  referenceIndex: number;
  onReferenceChange: (index: number) => void;
}

export default function PhotoUploader({
  files,
  onChange,
  referenceIndex,
  onReferenceChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const newFiles = [...files];
    for (let i = 0; i < selected.length; i++) {
      if (newFiles.length >= 5) break;
      const f = selected[i];
      if (f.type.startsWith("image/")) {
        newFiles.push(f);
      }
    }
    onChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
    if (referenceIndex >= newFiles.length) {
      onReferenceChange(Math.max(0, newFiles.length - 1));
    } else if (index < referenceIndex) {
      onReferenceChange(referenceIndex - 1);
    } else if (index === referenceIndex) {
      onReferenceChange(0);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Photos (1-5)
      </label>

      <div
        className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-gray-400">
          {files.length === 0
            ? "Click or drag & drop images here"
            : `${files.length}/5 photos selected`}
        </p>
      </div>

      {files.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mt-3 mb-1">
            Click a photo to select it as the character reference (highlighted in blue)
          </p>
          <div className="flex gap-3 mt-1 flex-wrap">
            {files.map((file, i) => (
              <div
                key={i}
                className="relative group cursor-pointer"
                onClick={() => onReferenceChange(i)}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Photo ${i + 1}`}
                  className={`w-24 h-24 object-cover rounded-lg border-2 transition-all ${
                    i === referenceIndex
                      ? "border-blue-500 ring-2 ring-blue-500/50"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  X
                </button>
                {i === referenceIndex && (
                  <span className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-xs text-center py-0.5 rounded-b-lg font-medium">
                    Reference
                  </span>
                )}
                {i !== referenceIndex && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-center py-0.5 rounded-b-lg">
                    {i + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
