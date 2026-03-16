"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { getCategoryLabel, getCategoryColor, isSiteWeb, getSubcategoryLabel } from "@/lib/categories";
import { VideoPlayer } from "@/components/video-player";
import { CategoryFilter } from "@/components/category-filter";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Video, Play, X,
  ChevronUp, ChevronDown, Users, Settings, Image as ImageIcon, Globe, Search, GripVertical,
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  client: string;
  category: string;
  subcategory: string;
  thumbnailUrl: string;
  videoUrl: string;
  imageUrls: string;
  sortOrder: number;
  createdAt: string;
}

export default function AdminPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadVideos();
  }, []);

  function loadVideos() {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      });
  }

  async function handleDelete(e: React.MouseEvent, id: string, title: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Supprimer "${title}" ?`)) return;
    setDeleting(id);
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setDeleting(null);
  }

  async function moveVideo(e: React.MouseEvent, id: string, direction: "up" | "down") {
    e.preventDefault();
    e.stopPropagation();
    const index = videos.findIndex((v) => v.id === id);
    if (index === -1) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= videos.length) return;

    const newVideos = [...videos];
    [newVideos[index], newVideos[swapIndex]] = [newVideos[swapIndex], newVideos[index]];
    setVideos(newVideos);

    setSaving(true);
    await fetch("/api/videos/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newVideos.map((v) => v.id) }),
    });
    setSaving(false);
  }

  function renderPreviewContent(item: VideoItem) {
    const isWeb = isSiteWeb(item.category);
    const parsedImages: string[] = JSON.parse(item.imageUrls || "[]");

    if (item.videoUrl) return <VideoPlayer url={item.videoUrl} title={item.title} />;
    if (isWeb && parsedImages.length > 0) return <div className="rounded-xl overflow-hidden"><img src={parsedImages[0]} alt={item.title} className="w-full h-auto object-contain" /></div>;
    if (parsedImages.length > 0) return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{parsedImages.map((url: string, i: number) => <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden"><img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>)}</div>;
    return <p className="text-zinc-500 text-center py-8">Aucun contenu</p>;
  }

  const filtered = videos.filter((v) => {
    const matchCategory = !activeCategory || v.category === activeCategory;
    const matchSubcategory = !activeSubcategory || v.subcategory === activeSubcategory;
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.client.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSubcategory && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewVideo(null)}>
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{previewVideo.title}</h3>
                <p className="text-sm text-zinc-500">{previewVideo.client}</p>
              </div>
              <button onClick={() => setPreviewVideo(null)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition"><X size={20} /></button>
            </div>
            {renderPreviewContent(previewVideo)}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
            <p className="text-zinc-500 mt-1">
              {videos.length} contenu{videos.length !== 1 ? "s" : ""}
              {saving && <span className="text-xs text-zinc-600 ml-2">Sauvegarde...</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300 rounded-xl transition">
              <Settings size={16} />
              <span className="hidden sm:inline text-sm">Réglages</span>
            </Link>
            <Link href="/admin/clients" className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-zinc-300 rounded-xl transition">
              <Users size={16} />
              <span className="hidden sm:inline text-sm">Clients</span>
            </Link>
            <Link href="/admin/new" className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition">
              <Plus size={18} />
              Ajouter
            </Link>
          </div>
        </div>

        {/* Filters (same as front) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <CategoryFilter
            active={activeCategory}
            onChange={setActiveCategory}
            activeSubcategory={activeSubcategory}
            onSubcategoryChange={setActiveSubcategory}
          />
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition w-full sm:w-56" />
          </div>
        </div>

        {/* Grid — same as front office but with admin overlays */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass rounded-2xl">
            <Video size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 text-lg">Aucun contenu</p>
            <Link href="/admin/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition">
              <Plus size={16} /> Ajouter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((video, i) => {
              const color = getCategoryColor(video.category);
              const isWeb = isSiteWeb(video.category);
              const isMarketing = video.category === "marketing-digital";
              const HoverIcon = isMarketing ? ImageIcon : isWeb ? Globe : Play;
              const globalIndex = videos.findIndex((v) => v.id === video.id);

              return (
                <div key={video.id} className="group relative animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  {/* Card (same as front) */}
                  <div className={`relative ${isMarketing ? "aspect-square" : "aspect-video"} rounded-2xl overflow-hidden glass-strong cursor-pointer`}
                    onClick={() => setPreviewVideo(video)}>
                    <Image src={video.thumbnailUrl} alt={video.title} fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className={`w-14 h-14 rounded-full ${color.bg} backdrop-blur-md flex items-center justify-center border ${color.border}`}>
                        <HoverIcon size={22} className={`${color.text} ${!isMarketing && !isWeb ? "ml-0.5" : ""}`} fill={!isMarketing && !isWeb ? "currentColor" : "none"} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span className="text-xs font-medium text-white uppercase tracking-wider">
                          {getCategoryLabel(video.category)}
                          {video.subcategory && ` · ${getSubcategoryLabel(video.category, video.subcategory)}`}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-lg leading-tight">{video.client}</h3>
                      <p className="text-white/80 text-sm mt-1">{video.title}</p>
                    </div>

                    {/* Admin overlay — top right actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => moveVideo(e, video.id, "up")}
                        disabled={globalIndex === 0}
                        className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white/70 hover:text-white disabled:opacity-30 transition"
                        title="Monter"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={(e) => moveVideo(e, video.id, "down")}
                        disabled={globalIndex === videos.length - 1}
                        className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white/70 hover:text-white disabled:opacity-30 transition"
                        title="Descendre"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <Link
                        href={`/admin/edit/${video.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white/70 hover:text-white transition"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, video.id, video.title)}
                        disabled={deleting === video.id}
                        className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white/70 hover:text-red-400 transition disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Sort order badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white/50 opacity-0 group-hover:opacity-100 transition">
                      #{globalIndex + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
