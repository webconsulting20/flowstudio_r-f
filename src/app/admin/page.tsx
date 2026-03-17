"use client";

import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { getCategoryLabel, getCategoryColor, isSiteWeb, isMarketingDigital, getSubcategoryLabel } from "@/lib/categories";
import { VideoPlayer } from "@/components/video-player";
import { CategoryFilter } from "@/components/category-filter";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Video, Play, X,
  Users, Settings, Image as ImageIcon, Globe, Search, LayoutGrid, List,
  CheckSquare, Square, ArrowUpToLine, ArrowDownToLine,
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drag and drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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

  function handleDragStart(index: number) {
    dragItem.current = index;
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }

  async function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const newVideos = [...videos];
    const draggedItem = newVideos[dragItem.current];
    newVideos.splice(dragItem.current, 1);
    newVideos.splice(dragOverItem.current, 0, draggedItem);

    dragItem.current = null;
    dragOverItem.current = null;

    setVideos(newVideos);
    setSaving(true);
    await fetch("/api/videos/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newVideos.map((v) => v.id) }),
    });
    setSaving(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((v) => v.id)));
  }

  async function deleteSelected() {
    if (!confirm(`Supprimer ${selectedIds.size} réalisation(s) ?`)) return;
    for (const id of Array.from(selectedIds)) {
      await fetch(`/api/videos/${id}`, { method: "DELETE" });
    }
    setVideos((prev) => prev.filter((v) => !selectedIds.has(v.id)));
    setSelectedIds(new Set());
    setSelectMode(false);
  }

  async function moveSelectedToTop() {
    const sel = videos.filter((v) => selectedIds.has(v.id));
    const rest = videos.filter((v) => !selectedIds.has(v.id));
    const newOrder = [...sel, ...rest];
    setVideos(newOrder);
    setSaving(true);
    await fetch("/api/videos/reorder", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderedIds: newOrder.map((v) => v.id) }) });
    setSaving(false);
  }

  async function moveSelectedToBottom() {
    const sel = videos.filter((v) => selectedIds.has(v.id));
    const rest = videos.filter((v) => !selectedIds.has(v.id));
    const newOrder = [...rest, ...sel];
    setVideos(newOrder);
    setSaving(true);
    await fetch("/api/videos/reorder", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderedIds: newOrder.map((v) => v.id) }) });
    setSaving(false);
  }

  function renderPreviewContent(item: VideoItem) {
    const isWeb = isSiteWeb(item.category);
    const parsedImages: string[] = JSON.parse(item.imageUrls || "[]");

    if (item.videoUrl) return <VideoPlayer url={item.videoUrl} title={item.title} />;
    if (isWeb && parsedImages.length > 0) return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{parsedImages.map((url: string, i: number) => <div key={i} className="relative aspect-video rounded-xl overflow-hidden"><img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>)}</div>;
    if (parsedImages.length > 0) return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{parsedImages.map((url: string, i: number) => <div key={i} className="relative aspect-[4/5] rounded-xl overflow-hidden"><img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>)}</div>;
    return <p className="text-zinc-400 text-center py-8">Aucun contenu</p>;
  }

  const filtered = videos.filter((v) => {
    const matchCategory = !activeCategory || v.category === activeCategory;
    const matchSubcategory = !activeSubcategory || (v.subcategory && v.subcategory.split(",").map((s: string) => s.trim()).includes(activeSubcategory));
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.client.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSubcategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      {/* Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewVideo(null)}>
          <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{previewVideo.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{previewVideo.client}</p>
              </div>
              <button onClick={() => setPreviewVideo(null)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg transition"><X size={20} /></button>
            </div>
            {renderPreviewContent(previewVideo)}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Administration</h1>
            <p className="text-zinc-400 mt-1">
              {videos.length} contenu{videos.length !== 1 ? "s" : ""}
              {saving && <span className="text-xs text-zinc-400 ml-2">Sauvegarde...</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 rounded-xl transition">
              <Settings size={16} />
              <span className="hidden sm:inline text-sm">Réglages</span>
            </Link>
            <Link href="/admin/clients" className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 rounded-xl transition">
              <Users size={16} />
              <span className="hidden sm:inline text-sm">Clients</span>
            </Link>
            <button
              onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
              className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl transition text-sm font-medium ${selectMode ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent" : "bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"}`}
            >
              <CheckSquare size={16} />
              <span className="hidden sm:inline">Sélectionner</span>
            </button>
            <Link href="/admin/new" className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded-xl transition">
              <Plus size={18} />
              Ajouter
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <CategoryFilter
            active={activeCategory}
            onChange={setActiveCategory}
            activeSubcategory={activeSubcategory}
            onSubcategoryChange={setActiveSubcategory}
          />
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-white/[0.06] rounded-lg p-0.5 border border-zinc-200 dark:border-white/[0.06]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition ${viewMode === "grid" ? "bg-white dark:bg-white/[0.1] shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition ${viewMode === "list" ? "bg-white dark:bg-white/[0.1] shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}
              >
                <List size={16} />
              </button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition w-full sm:w-56" />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-zinc-100 dark:bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-zinc-50 dark:bg-white/[0.03] rounded-2xl border border-zinc-200 dark:border-white/[0.06]">
            <Video size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg">Aucun contenu</p>
            <Link href="/admin/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded-xl transition">
              <Plus size={16} /> Ajouter
            </Link>
          </div>
        ) : viewMode === "list" ? (
          /* LIST VIEW */
          <div className="space-y-2">
            {filtered.map((video, i) => {
              const globalIndex = videos.findIndex((v) => v.id === video.id);
              const isMarketing = isMarketingDigital(video.category);
              return (
                <div
                  key={video.id}
                  draggable={!selectMode}
                  onDragStart={() => !selectMode && handleDragStart(globalIndex)}
                  onDragEnter={() => !selectMode && handleDragEnter(globalIndex)}
                  onDragEnd={() => !selectMode && handleDragEnd()}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => selectMode && toggleSelect(video.id)}
                  className={`flex items-center gap-4 p-3 bg-zinc-50 dark:bg-white/[0.03] border rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition group animate-fade-in ${selectMode ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} ${selectMode && selectedIds.has(video.id) ? "border-zinc-900 dark:border-white bg-zinc-100 dark:bg-white/[0.08]" : "border-zinc-200 dark:border-white/[0.06]"}`}
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  {/* Checkbox or drag handle */}
                  {selectMode ? (
                    <div className={`w-5 h-5 flex items-center justify-center ${selectedIds.has(video.id) ? "text-zinc-900 dark:text-white" : "text-zinc-300 dark:text-zinc-600"}`}>
                      {selectedIds.has(video.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                  ) : (
                    <div className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" /><circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" /><circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" /></svg>
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className={`relative ${isMarketing ? "w-12 h-14" : "w-20 h-12"} rounded-lg overflow-hidden flex-shrink-0`}>
                    <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" sizes="80px" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{video.client}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{video.title}</p>
                  </div>

                  {/* Category */}
                  <span className="hidden md:inline-block px-2.5 py-1 bg-zinc-200 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full">
                    {getCategoryLabel(video.category)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-white/[0.06] rounded-lg transition"
                    >
                      <Play size={14} />
                    </button>
                    <Link
                      href={`/admin/edit/${video.id}`}
                      className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-white/[0.06] rounded-lg transition"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, video.id, video.title)}
                      disabled={deleting === video.id}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW */
          <div className={`grid gap-6 ${
            activeCategory === "marketing-digital"
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {filtered.map((video, i) => {
              const color = getCategoryColor(video.category);
              const isWeb = isSiteWeb(video.category);
              const isMarketing = isMarketingDigital(video.category);
              const HoverIcon = isMarketing ? ImageIcon : isWeb ? Globe : Play;
              const globalIndex = videos.findIndex((v) => v.id === video.id);

              return (
                <div
                  key={video.id}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                  draggable={!selectMode}
                  onDragStart={() => !selectMode && handleDragStart(globalIndex)}
                  onDragEnter={() => !selectMode && handleDragEnter(globalIndex)}
                  onDragEnd={() => !selectMode && handleDragEnd()}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Checkbox overlay in select mode */}
                  {selectMode && (
                    <button
                      onClick={() => toggleSelect(video.id)}
                      className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center shadow transition ${selectedIds.has(video.id) ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "bg-white/80 text-zinc-400"}`}
                    >
                      {selectedIds.has(video.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                  )}
                  <div
                    className={`relative ${isMarketing ? "aspect-[4/5]" : "aspect-video"} rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${selectMode ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} ${selectMode && selectedIds.has(video.id) ? "ring-2 ring-zinc-900 dark:ring-white" : ""}`}
                    onClick={() => selectMode ? toggleSelect(video.id) : setPreviewVideo(video)}>
                    <Image src={video.thumbnailUrl} alt={video.title} fill
                      className={`${isMarketing ? "object-contain bg-zinc-100 dark:bg-zinc-800" : "object-cover"} transition-transform duration-700 group-hover:scale-105`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className={`${isMarketing ? "w-10 h-10" : "w-14 h-14"} rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30`}>
                        <HoverIcon size={isMarketing ? 16 : 22} className={`text-white ${!isMarketing && !isWeb ? "ml-0.5" : ""}`} fill={!isMarketing && !isWeb ? "currentColor" : "none"} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className={`absolute bottom-0 left-0 right-0 ${isMarketing ? "p-3" : "p-5"}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span className={`font-medium text-white uppercase tracking-wider ${isMarketing ? "text-[10px]" : "text-xs"}`}>
                          {getCategoryLabel(video.category)}
                          {video.subcategory && ` · ${getSubcategoryLabel(video.category, video.subcategory)}`}
                        </span>
                      </div>
                      <h3 className={`text-white font-semibold leading-tight ${isMarketing ? "text-sm" : "text-lg"}`}>{video.client}</h3>
                      <p className={`text-white/80 mt-1 ${isMarketing ? "text-xs" : "text-sm"}`}>{video.title}</p>
                    </div>

                    {/* Admin overlay — top right actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Link
                        href={`/admin/edit/${video.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-zinc-700 hover:text-zinc-900 transition shadow-sm"
                        title="Modifier"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, video.id, video.title)}
                        disabled={deleting === video.id}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-zinc-700 hover:text-red-600 transition disabled:opacity-50 shadow-sm"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Sort order badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-xs text-zinc-600 opacity-0 group-hover:opacity-100 transition shadow-sm">
                      #{globalIndex + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Selection action bar */}
      {selectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-800 rounded-2xl shadow-2xl border border-white/[0.08]">
          <button onClick={toggleSelectAll} className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition">
            {selectedIds.size === filtered.length ? <CheckSquare size={15} /> : <Square size={15} />}
            {selectedIds.size === filtered.length ? "Tout désélect." : "Tout sélect."}
          </button>
          <div className="w-px h-5 bg-white/[0.1]" />
          <span className="text-sm text-zinc-400 px-1">{selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}</span>
          <div className="w-px h-5 bg-white/[0.1]" />
          <button onClick={moveSelectedToTop} disabled={selectedIds.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-white disabled:opacity-40 transition">
            <ArrowUpToLine size={15} /> En haut
          </button>
          <button onClick={moveSelectedToBottom} disabled={selectedIds.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-white disabled:opacity-40 transition">
            <ArrowDownToLine size={15} /> En bas
          </button>
          <div className="w-px h-5 bg-white/[0.1]" />
          <button onClick={deleteSelected} disabled={selectedIds.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 disabled:opacity-40 transition">
            <Trash2 size={15} /> Supprimer
          </button>
          <button onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }} className="p-1.5 text-zinc-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
