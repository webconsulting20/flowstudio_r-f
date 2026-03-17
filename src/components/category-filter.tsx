"use client";

import { CATEGORIES } from "@/lib/categories";

interface CategoryFilterProps {
  active: string | null;
  onChange: (slug: string | null) => void;
  activeSubcategory?: string | null;
  onSubcategoryChange?: (slug: string | null) => void;
}

export function CategoryFilter({ active, onChange, activeSubcategory, onSubcategoryChange }: CategoryFilterProps) {
  const activeCat = CATEGORIES.find((c) => c.slug === active);
  const subcategories = activeCat?.subcategories ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { onChange(null); onSubcategoryChange?.(null); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            active === null
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-500 hover:text-zinc-900 border border-zinc-200"
          }`}
        >
          Toutes
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => { onChange(cat.slug); onSubcategoryChange?.(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              active === cat.slug
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 hover:text-zinc-900 border border-zinc-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Subcategory filters */}
      {subcategories.length > 0 && activeCat && (
        <div className="flex flex-wrap gap-2 pl-1 animate-fade-in">
          <button
            onClick={() => onSubcategoryChange?.(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              activeSubcategory === null
                ? "bg-zinc-200 text-zinc-900 border border-zinc-300"
                : "bg-zinc-50 text-zinc-500 hover:text-zinc-700 border border-zinc-200"
            }`}
          >
            Tous
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.slug}
              onClick={() => onSubcategoryChange?.(sub.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                activeSubcategory === sub.slug
                  ? "bg-zinc-200 text-zinc-900 border border-zinc-300"
                  : "bg-zinc-50 text-zinc-500 hover:text-zinc-700 border border-zinc-200"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
