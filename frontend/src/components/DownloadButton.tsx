"use client";

interface Props {
  url: string;
}

export default function DownloadButton({ url }: Props) {
  return (
    <a
      href={url}
      download
      className="inline-block py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-center"
    >
      Download MP4
    </a>
  );
}
