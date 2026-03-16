"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { VideoForm } from "@/components/video-form";

export default function EditVideoPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/videos/${params.id}`)
      .then((r) => r.json())
      .then((video) => {
        setData(video);
        setLoading(false);
      });
  }, [params.id]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <VideoForm
            videoId={params.id}
            initialData={{
              title: data.title,
              client: data.client,
              description: data.description || "",
              category: data.category,
              subcategory: data.subcategory || "",
              thumbnailUrl: data.thumbnailUrl,
              videoUrl: data.videoUrl || "",
              imageUrls: data.imageUrls || "[]",
            }}
          />
        ) : (
          <p className="text-zinc-500">Contenu non trouvé</p>
        )}
      </main>
    </div>
  );
}
