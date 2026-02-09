"use client";

interface Props {
  src: string;
}

export default function VideoPlayer({ src }: Props) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
      <video
        src={src}
        controls
        autoPlay
        className="w-full"
      />
    </div>
  );
}
