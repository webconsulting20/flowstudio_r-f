import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { VideoPlayer } from "@/components/video-player";
import { getCategoryLabel, getCategoryColor, isMarketingDigital, isSiteWeb, getSubcategoryLabel } from "@/lib/categories";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { BackButton } from "@/components/back-button";

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const video = await prisma.video.findUnique({ where: { id: params.id } });

  if (!video) notFound();

  const color = getCategoryColor(video.category);
  const isMarketing = isMarketingDigital(video.category);
  const isWeb = isSiteWeb(video.category);
  const images: string[] = (isMarketing || isWeb) ? JSON.parse(video.imageUrls || "[]") : [];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />

        {/* Content display based on category */}
        {isMarketing && images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {images.map((url, i) => (
              <div key={i} className={`relative aspect-[4/5] rounded-2xl overflow-hidden border ${color.border} bg-white/[0.03]`}>
                <img
                  src={url}
                  alt={`${video.title} - Image ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : isWeb && images.length > 0 ? (
          <div className={`relative rounded-2xl overflow-hidden border ${color.border} bg-white/[0.03]`}>
            <img
              src={images[0]}
              alt={video.title}
              className="w-full h-auto object-contain"
            />
          </div>
        ) : video.videoUrl ? (
          <VideoPlayer url={video.videoUrl} title={video.title} />
        ) : null}

        <div className="mt-8 space-y-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${color.dot}`} />
              <span className={`text-sm font-medium ${color.text} uppercase tracking-wider`}>
                {getCategoryLabel(video.category)}
                {video.subcategory && ` · ${getSubcategoryLabel(video.category, video.subcategory)}`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{video.title}</h1>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{video.client}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={16} className={color.text} />
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
            <div className={`glass rounded-2xl p-6 border ${color.border}`}>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
