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

const CLOUD_NAME = "dbkrfo4aa";
const UPLOAD_PRESET = "flowstudio_videos";
const CHUNK_SIZE = 20 * 1024 * 1024; // 20 MB par chunk

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

  const borderClass = accentColor?.border ?? "border-zinc-200 dark:border-white/10";
  const bgClass = accentColor?.bg ?? "bg-zinc-50 dark:bg-white/5";
  const textClass = accentColor?.text ?? "text-zinc-400";

  async function handleFile(file: File) {
    setUploading(true);
    setFileName(file.name);
    setProgress(0);

    const isVideo = type === "video" || file.type.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";
    const folder = type === "video" ? "flowstudio/videos" : "flowstudio/thumbnails";

    try {
      // Pour les gros fichiers vidéo (> 20MB) : upload chunké
      if (isVideo && file.size > CHUNK_SIZE) {
        await uploadChunked(file, resourceType, folder);
      } else {
        await uploadDirect(file, resourceType, folder);
      }
    } catch (err) {
      console.error("[FileUpload] Error:", err);
      alert("Erreur lors de l'upload");
      setUploading(false);
      setProgress(0);
    }
  }

  // Upload direct (petits fichiers / images)
  async function uploadDirect(file: File, resourceType: string, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

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
        console.error("[FileUpload] Cloudinary error:", xhr.status, xhr.responseText);
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
  }

  // Upload chunké pour les gros fichiers vidéo
  async function uploadChunked(file: File, resourceType: string, folder: string) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uniqueId = `uqid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let resultUrl = "";

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", folder);

      const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

      const response = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
        xhr.setRequestHeader("X-Unique-Upload-Id", uniqueId);
        xhr.setRequestHeader("Content-Range", contentRange);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const chunkProgress = e.loaded / e.total;
            const totalProgress = ((i + chunkProgress) / totalChunks) * 100;
            setProgress(Math.round(totalProgress));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            resolve(xhr.responseText);
          } else if (xhr.status === 408 || xhr.status === 499) {
            // Chunk accepté, pas encore fini
            resolve("");
          } else {
            reject(new Error(`Chunk ${i + 1}/${totalChunks} failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error(`Network error on chunk ${i + 1}`));
        xhr.send(formData);
      });

      // Le dernier chunk retourne le résultat final
      if (response && i === totalChunks - 1) {
        const result = JSON.parse(response);
        resultUrl = result.secure_url;
      }
    }

    if (resultUrl) {
      setProgress(100);
      onUploaded(resultUrl);
      setTimeout(() => setUploading(false), 500);
    } else {
      throw new Error("Upload chunké terminé sans URL de résultat");
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
      {label && <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-300 mb-2">{label}</label>}
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
            ? `border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5`
            : `border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/5`
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
              <div className="h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 dark:bg-white/60 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : hasFile ? (
          <div className="flex items-center gap-3 p-4">
            <CheckCircle size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
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
              className="p-1 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 px-4">
            <Upload size={24} className="text-zinc-400 dark:text-zinc-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Glissez un fichier ici ou <span className="text-zinc-700 dark:text-white/60">parcourir</span>
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              {type === "video" ? "MP4, MOV, WebM (max 100MB)" : "JPG, PNG, WebP"}
            </p>
          </div>
        )}
      </div>

      {/* Preview for thumbnails */}
      {type === "thumbnail" && currentUrl && (
        <img
          src={currentUrl}
          alt="Aperçu miniature"
          className={`mt-3 w-full max-w-sm ${previewAspect} rounded-xl object-cover bg-zinc-50 dark:bg-white/5 border ${borderClass}`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}
