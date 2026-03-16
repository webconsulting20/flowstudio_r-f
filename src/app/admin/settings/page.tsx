"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { FileUpload } from "@/components/file-upload";
import { ArrowLeft, Save, Type, Image as ImageIcon, FileText } from "lucide-react";
import Link from "next/link";

interface Settings {
  siteTitle: string;
  subtitle: string;
  logoUrl: string;
  footerText: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteTitle: "",
    subtitle: "",
    logoUrl: "",
    footerText: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  function update(field: keyof Settings, value: string) {
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
    "w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-transparent transition";

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition mb-6"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Réglages du site</h1>
            <p className="text-zinc-500 mt-1">Personnalisez l'apparence de votre portfolio</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <ImageIcon size={18} className="text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold">Logo</h2>
                <p className="text-xs text-zinc-500">Affiché en haut à gauche de la navbar</p>
              </div>
            </div>

            {settings.logoUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-12 w-auto object-contain bg-white/[0.03] rounded-lg p-1"
                />
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 text-xs bg-white/[0.05] hover:bg-white/[0.08] rounded-lg cursor-pointer transition">
                    Remplacer
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("type", "thumbnail");
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        if (res.ok) {
                          const { url } = await res.json();
                          update("logoUrl", url);
                        }
                      }}
                    />
                  </label>
                  <button
                    onClick={() => update("logoUrl", "")}
                    className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 py-8 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.03] transition">
                <ImageIcon size={20} className="text-zinc-500" />
                <span className="text-sm text-zinc-400">Cliquez pour uploader un logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("type", "thumbnail");
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    if (res.ok) {
                      const { url } = await res.json();
                      update("logoUrl", url);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Site Title */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <Type size={18} className="text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold">Titre principal</h2>
                <p className="text-xs text-zinc-500">Affiché en grand sur la page d'accueil</p>
              </div>
            </div>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => update("siteTitle", e.target.value)}
              className={inputClass}
              placeholder="FLOW STUDIO"
            />
          </div>

          {/* Subtitle */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <Type size={18} className="text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold">Sous-titre</h2>
                <p className="text-xs text-zinc-500">Affiché sous le titre principal</p>
              </div>
            </div>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              className={inputClass}
              placeholder="NOS RÉALISATIONS"
            />
          </div>

          {/* Footer */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <FileText size={18} className="text-zinc-400" />
              </div>
              <div>
                <h2 className="font-semibold">Texte du footer</h2>
                <p className="text-xs text-zinc-500">Copyright affiché en bas de page</p>
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

          {/* Preview */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Aperçu</h2>
            <div className="bg-zinc-950 rounded-xl p-6 border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                )}
                <span className="text-sm font-bold tracking-widest uppercase">
                  {settings.siteTitle || "FLOW STUDIO"}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{settings.siteTitle || "FLOW STUDIO"}</p>
                <p className="text-sm text-zinc-500 mt-1">{settings.subtitle || "NOS RÉALISATIONS"}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-zinc-600 text-center">
                  © {new Date().getFullYear()} {settings.footerText || "Flow Studio. Tous droits réservés."}
                </p>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-sm text-emerald-400 animate-fade-in">✓ Enregistré</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-900 font-semibold rounded-xl transition"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
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
