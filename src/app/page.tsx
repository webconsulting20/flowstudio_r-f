"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { VideoCard } from "@/components/video-card";
import { CategoryFilter } from "@/components/category-filter";
import { Search, LayoutGrid, Grid3X3, Grip } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  client: string;
  description: string;
  category: string;
  subcategory: string;
  thumbnailUrl: string;
  videoUrl: string;
  imageUrls: string;
  sortOrder: number;
}

interface SiteSettings {
  siteTitle: string;
  subtitle: string;
  footerText: string;
  logoUrl: string;
}

const FILTER_KEY = "portfolio-filters";
const SIZE_KEY = "portfolio-grid-size";
type GridSize = "large" | "medium" | "small";

function saveFilters(cat: string | null, sub: string | null, q: string) {
  try { sessionStorage.setItem(FILTER_KEY, JSON.stringify({ cat, sub, q })); } catch {}
}

function loadFilters(): { cat: string | null; sub: string | null; q: string } {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get("cat");
    // Restaurer les filtres UNIQUEMENT si on revient d'une vidéo (URL contient ?cat=)
    if (urlCat || urlParams.get("q")) {
      const result = { cat: urlCat, sub: urlParams.get("sub") || null, q: urlParams.get("q") || "" };
      sessionStorage.setItem(FILTER_KEY, JSON.stringify(result));
      return result;
    }
  } catch {}
  // Pas de paramètre URL = arrivée fraîche → toujours "Toutes les réalisations"
  try { sessionStorage.removeItem(FILTER_KEY); } catch {}
  return { cat: null, sub: null, q: "" };
}

export default function HomePage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, _setCat] = useState<string | null>(null);
  const [activeSubcategory, _setSub] = useState<string | null>(null);
  const [search, _setSearch] = useState("");
  const [gridSize, setGridSizeState] = useState<GridSize>("large");

  const setGridSize = (s: GridSize) => {
    setGridSizeState(s);
    try { localStorage.setItem(SIZE_KEY, s); } catch {}
  };

  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: "FLOW STUDIO",
    subtitle: "NOS RÉALISATIONS",
    footerText: "Flow Studio. Tous droits réservés.",
    logoUrl: "",
  });

  useEffect(() => {
    const saved = loadFilters();
    _setCat(saved.cat);
    _setSub(saved.sub);
    _setSearch(saved.q);
    try {
      const savedSize = localStorage.getItem(SIZE_KEY) as GridSize | null;
      if (savedSize) setGridSizeState(savedSize);
    } catch {}
    setMounted(true);
  }, []);

  const setActiveCategory = (cat: string | null) => {
    _setCat(cat);
    _setSub(null);
    saveFilters(cat, null, search);
  };

  const setActiveSubcategory = (sub: string | null) => {
    _setSub(sub);
    saveFilters(activeCategory, sub, search);
  };

  const setSearch = (q: string) => {
    _setSearch(q);
    saveFilters(activeCategory, activeSubcategory, q);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/videos").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()).catch(() => settings),
    ]).then(([vids, s]) => {
      setVideos(vids);
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const filtered = videos.filter((v) => {
    const matchCategory = !activeCategory || v.category === activeCategory;
    const matchSubcategory = !activeSubcategory || (v.subcategory && v.subcategory.split(",").map((s: string) => s.trim()).includes(activeSubcategory));
    const matchSearch =
      !search ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.client.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSubcategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero */}
        <div className="mb-14 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none text-zinc-900 dark:text-zinc-100">
            {settings.siteTitle}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-zinc-400 mt-3">
            {settings.subtitle}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <CategoryFilter
            active={activeCategory}
            onChange={setActiveCategory}
            activeSubcategory={activeSubcategory}
            onSubcategoryChange={setActiveSubcategory}
          />

          <div className="flex items-center gap-3">
            {/* Grid size buttons */}
            <div className="flex items-center gap-0.5 p-1 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08] rounded-xl">
              {([
                { key: "large", icon: LayoutGrid, title: "Grande taille" },
                { key: "medium", icon: Grid3X3, title: "Taille moyenne" },
                { key: "small", icon: Grip, title: "Petite taille" },
              ] as { key: GridSize; icon: React.ElementType; title: string }[]).map(({ key, icon: Icon, title }) => (
                <button
                  key={key}
                  title={title}
                  onClick={() => setGridSize(key)}
                  className={`p-2 rounded-lg transition-all ${
                    gridSize === key
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 focus:border-transparent transition w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading || !mounted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-zinc-100 dark:bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-400">
            <p className="text-lg">Aucune référence trouvée</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            activeCategory === "marketing-digital"
              ? gridSize === "large" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              : gridSize === "medium" ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
              : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
              : gridSize === "large" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : gridSize === "medium" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          }`}>
            {filtered.map((video, i) => (
              <div
                key={video.id}
                className={`animate-fade-in ${!activeCategory && video.category === "marketing-digital" ? "max-w-[220px] mx-auto w-full" : ""}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <VideoCard
                  id={video.id}
                  title={video.title}
                  client={video.client}
                  category={video.category}
                  subcategory={video.subcategory}
                  thumbnailUrl={video.thumbnailUrl}
                  returnCat={activeCategory}
                  returnSub={activeSubcategory}
                  returnSearch={search}
                  gridSize={gridSize}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-100 dark:border-white/[0.06] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-400 tracking-wider uppercase">
          &copy; {new Date().getFullYear()} {settings.footerText}
        </div>
      </footer>
    </div>
  );
}
