"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
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
    "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-transparent transition";

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition mb-6"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Réglages du site</h1>
            <p className="text-zinc-400 mt-1">Personnalisez l&apos;apparence de votre portfolio</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200">
                <ImageIcon size={18} className="text-zinc-600" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900">Logo</h2>
                <p className="text-xs text-zinc-400">Affiché en haut à gauche de la navbar</p>
              </div>
            </div>

            {settings.logoUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-12 w-auto object-contain bg-white rounded-lg p-1 border border-zinc-200"
                />
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 text-xs bg-zinc-200 hover:bg-zinc-300 rounded-lg cursor-pointer transition text-zinc-700">
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
                    className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 py-8 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-100 transition">
                <ImageIcon size={20} className="text-zinc-400" />
                <span className="text-sm text-zinc-500">Cliquez pour uploader un logo</span>
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
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200">
                <Type size={18} className="text-zinc-600" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900">Titre principal</h2>
                <p className="text-xs text-zinc-400">Affiché en grand sur la page d&apos;accueil</p>
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
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200">
                <Type size={18} className="text-zinc-600" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900">Sous-titre</h2>
                <p className="text-xs text-zinc-400">Affiché sous le titre principal</p>
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
          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-200">
                <FileText size={18} className="text-zinc-600" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900">Texte du footer</h2>
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
              <span className="text-sm text-emerald-600 animate-fade-in">✓ Enregistré</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-semibold rounded-xl transition"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
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
