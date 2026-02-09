import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RESPLAT - AI Video Generator",
  description: "Transform photos and narratives into cinematic videos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <header className="border-b border-gray-800 px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">
            RESPLAT
          </a>
          <span className="ml-2 text-sm text-gray-500">
            AI Cinematic Video Generator
          </span>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
