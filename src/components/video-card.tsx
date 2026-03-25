"use client";

import Image from "next/image";
import { Play, Image as ImageIcon, Globe } from "lucide-react";
import { getCategoryLabel, isMarketingDigital, isSiteWeb, getSubcategoryLabel } from "@/lib/categories";

interface VideoCardProps {
  id: string;
  title: string;
  client: string;
  category: string;
  subcategory?: string;
  thumbnailUrl: string;
  returnCat?: string | null;
  returnSub?: string | null;
  returnSearch?: string;
  gridSize?: "large" | "medium" | "small";
}

export function VideoCard({ id, title, client, category, subcategory, thumbnailUrl, returnCat, returnSub, returnSearch, gridSize = "large" }: VideoCardProps) {
  const isMarketing = isMarketingDigital(category);
  const isWeb = isSiteWeb(category);

  const HoverIcon = isMarketing ? ImageIcon : isWeb ? Globe : Play;

  const params = new URLSearchParams();
  if (returnCat) params.set("from_cat", returnCat);
  if (returnSub) params.set("from_sub", returnSub);
  if (returnSearch) params.set("from_q", returnSearch);
  const query = params.toString();
  const href = query ? `/video/${id}?${query}` : `/video/${id}`;

  return (
    <a href={href} className="group block">
      <div className={`relative ${isMarketing ? "aspect-[4/5]" : "aspect-video"} rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300`}>
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className={`${isMarketing ? "object-contain bg-zinc-100 dark:bg-zinc-800" : "object-cover"} transition-transform duration-700 group-hover:scale-105`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Hover icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className={`${isMarketing ? "w-10 h-10" : "w-14 h-14"} rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30`}>
            <HoverIcon size={isMarketing ? 16 : 22} className={`text-white ${!isMarketing && !isWeb ? "ml-0.5" : ""}`} fill={!isMarketing && !isWeb ? "currentColor" : "none"} />
          </div>
        </div>

        {/* Info */}
        <div className={`absolute bottom-0 left-0 right-0 ${isMarketing || gridSize === "small" ? "p-2" : gridSize === "medium" ? "p-3" : "p-5"}`}>
          <h3 className={`text-white font-semibold leading-tight ${isMarketing || gridSize === "small" ? "text-[11px]" : gridSize === "medium" ? "text-sm" : "text-lg"}`}>{title}</h3>
          <p className={`text-white/80 leading-tight ${isMarketing || gridSize === "small" ? "text-[10px] mt-0.5" : gridSize === "medium" ? "text-xs mt-0.5" : "text-sm mt-1"}`}>{client}</p>
        </div>
      </div>
    </a>
  );
}
