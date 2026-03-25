const NEUTRAL_COLOR = {
  bg: "bg-zinc-100",
  bgSolid: "bg-zinc-800",
  bgHover: "hover:bg-zinc-700",
  text: "text-zinc-600",
  textSolid: "text-zinc-700",
  border: "border-zinc-200",
  badge: "bg-zinc-100",
  ring: "ring-zinc-300",
  gradient: "from-zinc-100 to-transparent",
  dot: "bg-zinc-400",
} as const;

export const CATEGORIES = [
  {
    slug: "motion-design",
    label: "Motion Design",
    description: "Animations et motion graphics",
    subcategories: [
      { slug: "formation", label: "Formation" },
      { slug: "produit", label: "Produit" },
      { slug: "sensibilisation", label: "Sensibilisation" },
      { slug: "artistique", label: "Artistique" },
      { slug: "visuel-anime", label: "Visuel animé" },
    ],
    color: NEUTRAL_COLOR,
  },
  {
    slug: "filme",
    label: "Filmé",
    description: "Productions vidéo et tournages",
    subcategories: [
      { slug: "formation", label: "Formation" },
      { slug: "produit", label: "Produit" },
      { slug: "institutionnel", label: "Institutionnel" },
      { slug: "temoignage", label: "Témoignage" },
      { slug: "ia", label: "IA" },
      { slug: "couverture-mediatique", label: "Couverture médiatique" },
      { slug: "3d", label: "3D" },
    ],
    color: NEUTRAL_COLOR,
  },
  {
    slug: "marketing-digital",
    label: "Marketing Digital",
    description: "Campagnes et stratégie digitale",
    subcategories: [
      { slug: "organisme-financier", label: "Organisme financier" },
      { slug: "produit", label: "Produit" },
      { slug: "assurance", label: "Assurance" },
      { slug: "restauration", label: "Restauration" },
      { slug: "immobilier", label: "Immobilier" },
    ],
    color: NEUTRAL_COLOR,
  },
  {
    slug: "site-web",
    label: "Site Web",
    description: "Développement et design web",
    subcategories: [],
    color: NEUTRAL_COLOR,
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function getCategoryColor(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.color ?? NEUTRAL_COLOR;
}

export function getSubcategories(categorySlug: string) {
  return CATEGORIES.find((c) => c.slug === categorySlug)?.subcategories ?? [];
}

export function getSubcategoryLabel(categorySlug: string, subcategorySlug: string): string {
  const cat = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return subcategorySlug;
  // Support multi-subcategory (comma-separated)
  const slugs = subcategorySlug.split(",").map((s) => s.trim()).filter(Boolean);
  const labels = slugs.map((slug) => {
    const sub = cat.subcategories.find((s) => s.slug === slug);
    return sub?.label ?? slug;
  });
  return labels.join(" · ");
}

export function isMarketingDigital(category: string): boolean {
  return category === "marketing-digital";
}

export function isSiteWeb(category: string): boolean {
  return category === "site-web";
}
