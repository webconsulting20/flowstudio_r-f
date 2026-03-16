"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, Loader2 } from "lucide-react";

interface FileUploadProps {
  type: "video" | "thumbnail";
  accept: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label: string;
  accentColor?: {
    bg: string;
    text: string;
    border: string;
  };
  aspectClass?: string;
}

export function FileUpload({
  type,
  accept,
  currentUrl,
  onUploaded,
  label,
  accentColor,
  aspectClass,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const borderClass = accentColor?.border ?? "border-white/10";
  const bgClass = accentColor?.bg ?? "bg-white/5";
  const textClass = accentColor?.text ?? "text-zinc-400";

  async function handleFile(file: File) {
    setUploading(true);
    setFileName(file.name);
    setProgress(0);

    try {
      // 1. Obtenir la signature Cloudinary depuis notre API
      const folder = type === "video" ? "videos" : "thumbnails";
      const sigRes = await fetch("/api/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (!sigRes.ok) {
        // Fallback : upload via notre API (dev local)
        await uploadViaApi(file);
        return;
      }

      const { signature, timestamp, cloudName, apiKey, folder: cloudFolder } = await sigRes.json();

      // 2. Upload directement vers Cloudinary depuis le navigateur
      const isVideo = type === "video" || file.type.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", String(timestamp));
      formData.append("api_key", apiKey);
      formData.append("folder", cloudFolder);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setProgress(100);
          onUploaded(result.secure_url);
          setTimeout(() => setUploading(false), 500);
        } else {
          alert("Erreur lors de l'upload vers Cloudinary");
          setUploading(false);
          setProgress(0);
        }
      };

      xhr.onerror = () => {
        alert("Erreur réseau lors de l'upload");
        setUploading(false);
        setProgress(0);
      };

      xhr.send(formData);
    } catch {
      alert("Erreur lors de l'upload");
      setUploading(false);
      setProgress(0);
    }
  }

  // Fallback pour le développement local (sans Cloudinary)
  async function uploadViaApi(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 200);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'upload");
        setUploading(false);
        setProgress(0);
        return;
      }

      const { url } = await res.json();
      setProgress(100);
      onUploaded(url);
      setTimeout(() => setUploading(false), 500);
    } catch {
      clearInterval(progressInterval);
      alert("Erreur réseau lors de l'upload");
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const hasFile = !!currentUrl;
  const previewAspect = aspectClass ?? "aspect-video";

  return (
    <div>
      {label && <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed transition cursor-pointer ${
          dragOver
            ? `${borderClass} ${bgClass}`
            : hasFile
            ? `border-white/10 bg-white/5`
            : `border-white/10 hover:border-white/20 hover:bg-white/5`
        } ${uploading ? "pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3 py-8 px-4">
            <Loader2 size={24} className={`${textClass} animate-spin`} />
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span className="truncate max-w-[200px]">{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/60 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : hasFile ? (
          <div className="flex items-center gap-3 p-4">
            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300 truncate">
                {fileName || currentUrl?.split("/").pop()}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Cliquez ou glissez pour remplacer</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUploaded("");
                setFileName(null);
              }}
              className="p-1 text-zinc-500 hover:text-red-400 transition"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 px-4">
            <Upload size={24} className="text-zinc-500" />
            <p className="text-sm text-zinc-400">
              Glissez un fichier ici ou <span className="text-white/60">parcourir</span>
            </p>
            <p className="text-xs text-zinc-600">
              {type === "video" ? "MP4, MOV, WebM" : "JPG, PNG, WebP"}
            </p>
          </div>
        )}
      </div>

      {/* Preview for thumbnails */}
      {type === "thumbnail" && currentUrl && (
        <img
          src={currentUrl}
          alt="Aperçu miniature"
          className={`mt-3 w-full max-w-sm ${previewAspect} rounded-xl object-cover bg-white/5 border ${borderClass}`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}
