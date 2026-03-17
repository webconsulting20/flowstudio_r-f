"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { VideoCard } from "@/components/video-card";
import { CategoryFilter } from "@/components/category-filter";
import { Search } from "lucide-react";

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

function saveFilters(cat: string | null, sub: string | null, q: string) {
  try { sessionStorage.setItem(FILTER_KEY, JSON.stringify({ cat, sub, q })); } catch {}
}

function loadFilters(): { cat: string | null; sub: string | null; q: string } {
  // Priorité 1 : lire depuis l'URL (quand on revient via le bouton retour)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get("cat");
    if (urlCat) {
      const result = { cat: urlCat, sub: urlParams.get("sub") || null, q: urlParams.get("q") || "" };
      // Synchroniser sessionStorage avec l'URL
      sessionStorage.setItem(FILTER_KEY, JSON.stringify(result));
      return result;
    }
  } catch {}
  // Priorité 2 : lire depuis sessionStorage
  try {
    const stored = sessionStorage.getItem(FILTER_KEY);
    if (stored) {
      const p = JSON.parse(stored);
      return { cat: p.cat || null, sub: p.sub || null, q: p.q || "" };
    }
  } catch {}
  return { cat: null, sub: null, q: "" };
}

export default function HomePage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, _setCat] = useState<string | null>(null);
  const [activeSubcategory, _setSub] = useState<string | null>(null);
  const [search, _setSearch] = useState("");
  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: "FLOW STUDIO",
    subtitle: "NOS RÉALISATIONS",
    footerText: "Flow Studio. Tous droits réservés.",
    logoUrl: "",
  });

  // Restaurer les filtres depuis sessionStorage après le montage (évite l'erreur d'hydratation)
  useEffect(() => {
    const saved = loadFilters();
    _setCat(saved.cat);
    _setSub(saved.sub);
    _setSearch(saved.q);
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
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero */}
        <div className="mb-14 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
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

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-transparent transition w-full sm:w-56"
            />
          </div>
        </div>

        {/* Grid */}
        {loading || !mounted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <p className="text-lg">Aucune référence trouvée</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            activeCategory === "marketing-digital"
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {filtered.map((video, i) => (
              <div key={video.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <VideoCard
                  id={video.id}
                  title={video.title}
                  client={video.client}
                  category={video.category}
                  subcategory={video.subcategory}
                  thumbnailUrl={video.thumbnailUrl}
                  returnCat={activeCategory}
                  returnSub={activeSubcategory}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.04] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-700 tracking-wider uppercase">
          &copy; {new Date().getFullYear()} {settings.footerText}
        </div>
      </footer>
    </div>
  );
}
