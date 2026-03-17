"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, isMarketingDigital, isSiteWeb, getSubcategories } from "@/lib/categories";
import { FileUpload } from "@/components/file-upload";
import { VideoPlayer } from "@/components/video-player";
import { Save, ArrowLeft, Play, EyeOff, Plus, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface VideoFormData {
  title: string;
  client: string;
  description: string;
  category: string;
  subcategory: string;
  thumbnailUrl: string;
  videoUrl: string;
  imageUrls: string; // JSON string array
}

interface VideoFormProps {
  initialData?: VideoFormData;
  videoId?: string;
}

export function VideoForm({ initialData, videoId }: VideoFormProps) {
  const router = useRouter();
  const isEditing = !!videoId;

  const [form, setForm] = useState<VideoFormData>(
    initialData ?? {
      title: "",
      client: "",
      description: "",
      category: "motion-design",
      subcategory: "",
      thumbnailUrl: "",
      videoUrl: "",
      imageUrls: "[]",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  const isMarketing = isMarketingDigital(form.category);
  const isWeb = isSiteWeb(form.category);
  const images: string[] = JSON.parse(form.imageUrls || "[]");
  const selectedCat = CATEGORIES.find((c) => c.slug === form.category);
  const accentColor = selectedCat?.color;
  const subcategories = getSubcategories(form.category);

  function update(field: keyof VideoFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Reset subcategory when category changes
      if (field === "category" && value !== prev.category) {
        next.subcategory = "";
      }
      return next;
    });
    if (field === "videoUrl") setShowVideoPreview(false);
  }

  function toggleSubcategory(slug: string) {
    const current = form.subcategory ? form.subcategory.split(",").filter(Boolean) : [];
    let next: string[];
    if (current.includes(slug)) {
      // Décocher
      next = current.filter((s) => s !== slug);
    } else if (current.length < 2) {
      // Ajouter (max 2)
      next = [...current, slug];
    } else {
      // Remplacer le dernier
      next = [current[0], slug];
    }
    update("subcategory", next.join(","));
  }

  function updateImages(newImages: string[]) {
    setForm((prev) => ({ ...prev, imageUrls: JSON.stringify(newImages) }));
  }

  function addImage(url: string) {
    const maxImages = 4;
    if (images.length >= maxImages) return;
    updateImages([...images, url]);
  }

  function removeImage(index: number) {
    updateImages(images.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const url = isEditing ? `/api/videos/${videoId}` : "/api/videos";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de la sauvegarde");
      setSaving(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const canSubmit = form.title && form.client && form.thumbnailUrl && (
    isMarketing ? images.length > 0 :
    isWeb ? images.length > 0 :
    !!form.videoUrl
  );

  const inputClass =
    "w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 focus:border-transparent transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
      >
        <ArrowLeft size={16} />
        Retour
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {isEditing ? "Modifier" : "Ajouter un contenu"}
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-6 space-y-6">
        {/* Category picker */}
        <div>
          <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => update("category", cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
                  form.category === cat.slug
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent"
                    : "bg-white dark:bg-white/[0.03] text-zinc-500 border-zinc-200 dark:border-white/[0.06] hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${form.category === cat.slug ? "bg-white dark:bg-zinc-900" : "bg-zinc-400"}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory picker (max 2) */}
        {subcategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Sous-catégories <span className="text-zinc-400">(max 2)</span></label>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => {
                const selected = form.subcategory.split(",").filter(Boolean).includes(sub.slug);
                return (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => toggleSubcategory(sub.slug)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition border ${
                      selected
                        ? "bg-zinc-200 dark:bg-white/[0.1] text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-white/[0.15]"
                        : "bg-white dark:bg-white/[0.03] text-zinc-500 border-zinc-200 dark:border-white/[0.06] hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Title + Client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Titre *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
              placeholder="Nom du projet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Client *</label>
            <input
              type="text"
              required
              value={form.client}
              onChange={(e) => update("client", e.target.value)}
              className={inputClass}
              placeholder="Nom du client"
            />
          </div>
        </div>

        {/* Description (optional) */}
        <div>
          <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Description <span className="text-zinc-600 dark:text-zinc-500">(optionnel)</span>
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass}
            placeholder="Décrivez le projet, le contexte, les objectifs..."
          />
        </div>

        {/* Thumbnail — vertical for Marketing, horizontal for others */}
        <div>
          <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Miniature *
          </label>
          <FileUpload
            type="thumbnail"
            accept="image/jpeg,image/png,image/webp"
            currentUrl={form.thumbnailUrl}
            onUploaded={(url) => update("thumbnailUrl", url)}
            label=""
            accentColor={accentColor ? { bg: accentColor.bg, text: accentColor.text, border: accentColor.border } : undefined}
            aspectClass="aspect-video"
          />
        </div>

        {/* Conditional content based on category */}
        {isMarketing ? (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Images Instagram ({images.length}/4) *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((url, i) => (
                <div key={i} className={`relative aspect-[4/5] rounded-xl overflow-hidden border ${accentColor?.border ?? "border-zinc-200 dark:border-white/10"} bg-zinc-50 dark:bg-white/[0.03]`}>
                  <img src={url} alt={`Image ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <ImageUploadSlot
                  onUploaded={addImage}
                  borderClass={accentColor?.border ?? "border-zinc-200 dark:border-white/10"}
                  textClass={accentColor?.text ?? "text-zinc-400"}
                  aspectClass="aspect-[4/5]"
                />
              )}
            </div>
          </div>
        ) : isWeb ? (
          <div>
            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
              Images du site ({images.length}/4) * <span className="text-zinc-400">(format horizontal)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {images.map((url, i) => (
                <div key={i} className={`relative aspect-video rounded-xl overflow-hidden border ${accentColor?.border ?? "border-zinc-200 dark:border-white/[0.06]"} bg-zinc-50 dark:bg-white/[0.03]`}>
                  <img src={url} alt={`Image ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <ImageUploadSlot
                  onUploaded={addImage}
                  borderClass={accentColor?.border ?? "border-zinc-200 dark:border-white/[0.06]"}
                  textClass={accentColor?.text ?? "text-zinc-400"}
                  aspectClass="aspect-video"
                />
              )}
            </div>
          </div>
        ) : (
          <div>
            <FileUpload
              type="video"
              accept="video/mp4,video/quicktime,video/webm"
              currentUrl={form.videoUrl}
              onUploaded={(url) => {
                update("videoUrl", url);
                setShowVideoPreview(false);
              }}
              label="Fichier vidéo *"
              accentColor={accentColor ? { bg: accentColor.bg, text: accentColor.text, border: accentColor.border } : undefined}
            />

            {form.videoUrl && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowVideoPreview(!showVideoPreview)}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-2"
                >
                  {showVideoPreview ? <EyeOff size={14} /> : <Play size={14} />}
                  {showVideoPreview ? "Masquer l'aperçu" : "Prévisualiser la vidéo"}
                </button>
                {showVideoPreview && <VideoPlayer url={form.videoUrl} title={form.title || "Aperçu"} />}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-white dark:text-zinc-900 font-semibold rounded-xl transition"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isEditing ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}

// Mini component for uploading individual images
function ImageUploadSlot({
  onUploaded,
  borderClass,
  textClass,
  aspectClass = "aspect-[4/5]",
}: {
  onUploaded: (url: string) => void;
  borderClass: string;
  textClass: string;
  aspectClass?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "thumbnail");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        onUploaded(url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className={`relative ${aspectClass} rounded-xl border-2 border-dashed ${borderClass} flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition`}>
      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {uploading ? (
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <Plus size={20} className={textClass} />
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Ajouter</span>
        </>
      )}
    </label>
  );
}
