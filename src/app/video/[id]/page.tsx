import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { VideoPlayer } from "@/components/video-player";
import { getCategoryLabel, isMarketingDigital, isSiteWeb, getSubcategoryLabel } from "@/lib/categories";
import { Calendar, Tag, User } from "lucide-react";
import { BackButton } from "@/components/back-button";

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const video = await prisma.video.findUnique({ where: { id: params.id } });

  if (!video) notFound();

  const isMarketing = isMarketingDigital(video.category);
  const isWeb = isSiteWeb(video.category);
  const images: string[] = (isMarketing || isWeb) ? JSON.parse(video.imageUrls || "[]") : [];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />

        {/* Content display based on category */}
        <div className="max-w-3xl">
          {isMarketing && images.length > 0 ? (
            <div className="flex gap-3 w-full">
              {images.map((url, i) => (
                <div key={i} className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.03]">
                  <img
                    src={url}
                    alt={`${video.title} - Image ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : isWeb && images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.03]">
                  <img
                    src={url}
                    alt={`${video.title} - Image ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : video.videoUrl ? (
            <VideoPlayer url={video.videoUrl} title={video.title} />
          ) : null}
        </div>

        <div className="mt-8 space-y-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {getCategoryLabel(video.category)}
                {video.subcategory && ` · ${getSubcategoryLabel(video.category, video.subcategory)}`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{video.client}</h1>
            {video.title && (
              <p className="text-lg text-zinc-500 dark:text-zinc-400 mt-1">{video.title}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{video.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} />
              <span>
                {getCategoryLabel(video.category)}
                {video.subcategory && ` · ${getSubcategoryLabel(video.category, video.subcategory)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>
                {new Intl.DateTimeFormat("fr-FR", {
                  year: "numeric",
                  month: "long",
                }).format(video.createdAt)}
              </span>
            </div>
          </div>

          {video.description && (
            <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06]">
              <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Description</h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
