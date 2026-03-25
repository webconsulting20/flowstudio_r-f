"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { Play } from "lucide-react";

interface VideoItem {
  url: string;
  title: string;
}

export function VideoDetailClient({ allVideos }: { allVideos: VideoItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = allVideos.length > 1;

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="max-w-3xl">
        <VideoPlayer url={allVideos[activeIndex].url} title={allVideos[activeIndex].title} />
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
    </div>
  );
}
