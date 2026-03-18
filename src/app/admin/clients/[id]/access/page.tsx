"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { ArrowLeft, Save, Check, Film, Layers } from "lucide-react";
import { CATEGORIES, getCategoryLabel, getSubcategoryLabel } from "@/lib/categories";

interface Video {
  id: string;
  title: string;
  client: string;
  category: string;
  subcategory: string;
  thumbnailUrl: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

export default function ClientAccessPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients`).then((r) => r.json()),
      fetch(`/api/videos`).then((r) => r.json()),
      fetch(`/api/clients/${clientId}/access`).then((r) => r.json()),
    ]).then(([clients, vids, accessIds]: [ClientInfo[], Video[], string[]]) => {
      const found = clients.find((c) => c.id === clientId);
      setClient(found || null);
      setVideos(vids);
      setSelectedIds(new Set(accessIds));
      setLoading(false);
    });
  }, [clientId]);

  const filteredVideos = videos.filter((v) => {
    if (activeCategory !== "all" && v.category !== activeCategory) return false;
    if (activeSubcategory !== "all" && !v.subcategory.split(",").map((s) => s.trim()).includes(activeSubcategory)) return false;
    return true;
  });

  const currentCategory = CATEGORIES.find((c) => c.slug === activeCategory);
  const subcategories = currentCategory ? currentCategory.subcategories : [];

  function toggleVideo(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredVideos.forEach((v) => next.add(v.id));
      return next;
    });
  }

  function deselectAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredVideos.forEach((v) => next.delete(v.id));
      return next;
    });
  }

  function selectCategory(categorySlug: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      videos.filter((v) => v.category === categorySlug).forEach((v) => next.add(v.id));
      return next;
    });
  }

  const allFilteredSelected = filteredVideos.length > 0 && filteredVideos.every((v) => selectedIds.has(v.id));

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/clients/${clientId}/access`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoIds: Array.from(selectedIds) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-6"
        >
          <ArrowLeft size={16} />
          Retour aux clients
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Accès vidéos
            </h1>
            {client && (
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                {client.name} · <span className="font-mono text-xs">{client.email}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {selectedIds.size} vidéo{selectedIds.size !== 1 ? "s" : ""} sélectionnée{selectedIds.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 font-semibold rounded-xl transition"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              ) : saved ? (
                <Check size={16} className="text-emerald-500" />
              ) : (
                <Save size={16} />
              )}
              {saved ? "Enregistré" : "Enregistrer"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-zinc-100 dark:bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => { setActiveCategory("all"); setActiveSubcategory("all"); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeCategory === "all"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
                }`}
              >
                Toutes ({videos.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = videos.filter((v) => v.category === cat.slug).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => { setActiveCategory(cat.slug); setActiveSubcategory("all"); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      activeCategory === cat.slug
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                    <span className="text-xs opacity-60">({count})</span>
                    {/* Select whole category */}
                    {activeCategory !== cat.slug && (
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); selectCategory(cat.slug); }}
                        className="ml-1 text-xs underline opacity-60 hover:opacity-100"
                        title="Tout sélectionner"
                      >
                        +tout
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Subcategory filters */}
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveSubcategory("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeSubcategory === "all"
                      ? "bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
                  }`}
                >
                  Toutes sous-catégories
                </button>
                {subcategories.map((sub) => {
                  const count = videos.filter(
                    (v) => v.category === activeCategory && v.subcategory.split(",").map((s) => s.trim()).includes(sub.slug)
                  ).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={sub.slug}
                      onClick={() => setActiveSubcategory(sub.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        activeSubcategory === sub.slug
                          ? "bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900"
                          : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10"
                      }`}
                    >
                      {sub.label} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Select all / deselect all for current filter */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={allFilteredSelected ? deselectAllFiltered : selectAllFiltered}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline transition"
              >
                {allFilteredSelected ? "Tout désélectionner" : "Tout sélectionner"} ({filteredVideos.length})
              </button>
            </div>

            {/* Video grid */}
            {filteredVideos.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl">
                <Film size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-zinc-500">Aucune vidéo dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredVideos.map((video) => {
                  const isSelected = selectedIds.has(video.id);
                  return (
                    <button
                      key={video.id}
                      onClick={() => toggleVideo(video.id)}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isSelected
                          ? "border-zinc-900 dark:border-white ring-2 ring-zinc-900 dark:ring-white ring-offset-2 dark:ring-offset-zinc-950"
                          : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay */}
                        <div className={`absolute inset-0 transition-all ${isSelected ? "bg-zinc-900/30" : "bg-transparent group-hover:bg-zinc-900/10"}`} />
                        {/* Checkmark */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-zinc-900 dark:bg-white"
                            : "bg-white/70 dark:bg-zinc-800/70 opacity-0 group-hover:opacity-100"
                        }`}>
                          <Check size={12} className={isSelected ? "text-white dark:text-zinc-900" : "text-zinc-400"} />
                        </div>
                      </div>
                      <div className="px-2 py-2 bg-zinc-50 dark:bg-zinc-900">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{video.client}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">{video.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Layers size={9} className="text-zinc-400 flex-shrink-0" />
                          <p className="text-[10px] text-zinc-400 truncate">
                            {getCategoryLabel(video.category)}
                            {video.subcategory ? ` · ${getSubcategoryLabel(video.category, video.subcategory)}` : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
