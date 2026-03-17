"use client";

import Image from "next/image";
import { Play, Image as ImageIcon, Globe } from "lucide-react";
import { getCategoryLabel, getCategoryColor, isMarketingDigital, isSiteWeb, getSubcategoryLabel } from "@/lib/categories";

interface VideoCardProps {
  id: string;
  title: string;
  client: string;
  category: string;
  subcategory?: string;
  thumbnailUrl: string;
  returnCat?: string | null;
  returnSub?: string | null;
}

export function VideoCard({ id, title, client, category, subcategory, thumbnailUrl, returnCat, returnSub }: VideoCardProps) {
  const color = getCategoryColor(category);
  const isMarketing = isMarketingDigital(category);
  const isWeb = isSiteWeb(category);

  const HoverIcon = isMarketing ? ImageIcon : isWeb ? Globe : Play;

  // Construire l'URL avec les paramètres de retour
  const params = new URLSearchParams();
  if (returnCat) params.set("from_cat", returnCat);
  if (returnSub) params.set("from_sub", returnSub);
  const query = params.toString();
  const href = query ? `/video/${id}?${query}` : `/video/${id}`;

  return (
    <a href={href} className="group block">
      <div className={`relative ${isMarketing ? "aspect-[4/5]" : "aspect-video"} rounded-2xl overflow-hidden glass-strong`}>
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className={`${isMarketing ? "object-contain" : "object-cover"} transition-transform duration-700 group-hover:scale-105`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Hover icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className={`${isMarketing ? "w-10 h-10" : "w-14 h-14"} rounded-full ${color.bg} backdrop-blur-md flex items-center justify-center border ${color.border}`}>
            <HoverIcon size={isMarketing ? 16 : 22} className={`${color.text} ${!isMarketing && !isWeb ? "ml-0.5" : ""}`} fill={!isMarketing && !isWeb ? "currentColor" : "none"} />
          </div>
        </div>

        {/* Info */}
        <div className={`absolute bottom-0 left-0 right-0 ${isMarketing ? "p-3" : "p-5"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className={`font-medium text-white uppercase tracking-wider ${isMarketing ? "text-[10px]" : "text-xs"}`}>
              {getCategoryLabel(category)}
              {subcategory && ` · ${getSubcategoryLabel(category, subcategory)}`}
            </span>
          </div>
          <h3 className={`text-white font-semibold leading-tight ${isMarketing ? "text-sm" : "text-lg"}`}>{client}</h3>
          <p className={`text-white/80 mt-1 ${isMarketing ? "text-xs" : "text-sm"}`}>{title}</p>
        </div>
      </div>
    </a>
  );
}
