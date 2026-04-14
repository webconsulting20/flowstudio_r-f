"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { Play, Download } from "lucide-react";

interface VideoItem {
  url: string;
  title: string;
}

export function VideoDetailClient({
  allVideos,
  canDownload = false,
}: {
  allVideos: VideoItem[];
  canDownload?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = allVideos.length > 1;
  const activeVideo = allVideos[activeIndex];

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="max-w-3xl">
        <VideoPlayer url={activeVideo.url} title={activeVideo.title} />
      </div>

      {/* Video selector — only if multiple videos */}
      {hasMultiple && (
        <div className="max-w-3xl">
          <div className="flex gap-2 flex-wrap">
            {allVideos.map((v, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
                  i === activeIndex
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent"
                    : "bg-white dark:bg-white/[0.03] text-zinc-500 border-zinc-200 dark:border-white/[0.06] hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Play size={14} />
                {v.title || `Vidéo ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Download button — only for admin / superadmin */}
      {canDownload && activeVideo.url && (
        <div className="max-w-3xl">
          <a
            href={activeVideo.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 transition"
          >
            <Download size={15} />
            Télécharger
          </a>
        </div>
      )}
    </div>
  );
}
