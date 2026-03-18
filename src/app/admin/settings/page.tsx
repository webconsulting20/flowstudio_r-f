"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, Save, Type, Image as ImageIcon, FileText, AlignLeft, AlignCenter } from "lucide-react";
import Link from "next/link";

interface Settings {
  siteTitle: string;
  subtitle: string;
  logoUrl: string;
  footerText: string;
  titleSize: string;
  subtitleSize: string;
  heroDescription: string;
  heroDescriptionSize: string;
  heroAlign: string;
}

const DEFAULTS: Settings = {
  siteTitle: "FLOW STUDIO",
  subtitle: "NOS RÉALISATIONS",
  logoUrl: "",
  footerText: "Flow Studio. Tous droits réservés.",
  titleSize: "lg",
  subtitleSize: "lg",
  heroDescription: "",
  heroDescriptionSize: "md",
  heroAlign: "left",
};

const SIZE_OPTIONS = [
  { key: "xs", label: "XS" },
  { key: "sm", label: "S" },
  { key: "md", label: "M" },
  { key: "lg", label: "L" },
  { key: "xl", label: "XL" },
  { key: "2xl", label: "2XL" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({ ...DEFAULTS, ...data });
        setLoading(false);
      });
  }, []);

  function update<K extends keyof Settings>(field: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass =
    "w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 focus:border-transparent transition";

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-6"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Réglages du site</h1>
            <p className="text-zinc-400 mt-1">Personnalisez l&apos;apparence de votre portfolio</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200 dark:bg-white/[0.06]">
                <ImageIcon size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Logo</h2>
                <p className="text-xs text-zinc-400">Affiché en haut à gauche de la navbar</p>
              </div>
            </div>

            {settings.logoUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-12 w-auto object-contain bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-white/[0.06]"
                />
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-white/[0.06] hover:bg-zinc-300 dark:hover:bg-white/[0.1] rounded-lg cursor-pointer transition text-zinc-700 dark:text-zinc-300">
                    Remplacer
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const fd = new FormData(); fd.append("file", file); fd.append("type", "thumbnail");
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      if (res.ok) { const { url } = await res.json(); update("logoUrl", url); }
                    }} />
                  </label>
                  <button onClick={() => update("logoUrl", "")} className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition">
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 py-8 border-2 border-dashed border-zinc-300 dark:border-white/[0.1] rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition">
                <ImageIcon size={20} className="text-zinc-400" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Cliquez pour uploader un logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const fd = new FormData(); fd.append("file", file); fd.append("type", "thumbnail");
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  if (res.ok) { const { url } = await res.json(); update("logoUrl", url); }
                }} />
              </label>
            )}
          </div>

          {/* Alignment */}
          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200 dark:bg-white/[0.06]">
                <AlignLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Alignement de l&apos;en-tête</h2>
                <p className="text-xs text-zinc-400">Position du titre et sous-titre sur la page d&apos;accueil</p>
              </div>
            </div>
            <div className="flex gap-3">
              {([
                { key: "left", label: "Gauche", icon: AlignLeft },
                { key: "center", label: "Centré", icon: AlignCenter },
              ] as { key: string; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => update("heroAlign", key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-medium transition flex-1 justify-center ${
                    settings.heroAlign === key
                      ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "border-zinc-200 dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200 dark:bg-white/[0.06]">
                <Type size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Titre principal</h2>
                <p className="text-xs text-zinc-400">Affiché en grand sur la page d&apos;accueil</p>
              </div>
            </div>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => update("siteTitle", e.target.value)}
              className={inputClass + " mb-4"}
              placeholder="FLOW STUDIO"
            />
            <div>
              <p className="text-xs text-zinc-400 mb-2">Taille de la police</p>
              <SizeButtons value={settings.titleSize} onChange={(v) => update("titleSize", v)} options={SIZE_OPTIONS} />
            </div>
          </div>

          {/* Subtitle */}
          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200 dark:bg-white/[0.06]">
                <Type size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Sous-titre</h2>
                <p className="text-xs text-zinc-400">Affiché sous le titre (ex: NOS RÉALISATIONS)</p>
              </div>
            </div>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              className={inputClass + " mb-4"}
              placeholder="NOS RÉALISATIONS"
            />
            <div>
              <p className="text-xs text-zinc-400 mb-2">Taille de la police</p>
              <SizeButtons value={settings.subtitleSize} onChange={(v) => update("subtitleSize", v)} options={SIZE_OPTIONS.slice(0, 5)} />
            </div>
          </div>

          {/* Description */}
          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200 dark:bg-white/[0.06]">
                <FileText size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Description</h2>
                <p className="text-xs text-zinc-400">Texte affiché sous le sous-titre (optionnel)</p>
              </div>
            </div>
            <textarea
              value={settings.heroDescription}
              onChange={(e) => update("heroDescription", e.target.value)}
              rows={3}
              className={inputClass + " mb-4 resize-none"}
              placeholder="Agence de création audiovisuelle..."
            />
            <div>
              <p className="text-xs text-zinc-400 mb-2">Taille de la police</p>
              <SizeButtons value={settings.heroDescriptionSize} onChange={(v) => update("heroDescriptionSize", v)} options={SIZE_OPTIONS.slice(0, 4)} />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200 dark:bg-white/[0.06]">
                <FileText size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Texte du footer</h2>
                <p className="text-xs text-zinc-400">Copyright affiché en bas de page</p>
              </div>
            </div>
            <input
              type="text"
              value={settings.footerText}
              onChange={(e) => update("footerText", e.target.value)}
              className={inputClass}
              placeholder="Flow Studio. Tous droits réservés."
            />
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">Enregistré ✓</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 text-white dark:text-zinc-900 font-semibold rounded-xl transition"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-zinc-500 border-t-white dark:border-zinc-300 dark:border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function SizeButtons({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
            value === opt.key
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
              : "bg-white dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08] hover:border-zinc-400 dark:hover:border-white/20"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
