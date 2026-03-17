"use client";

import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const handleBack = () => {
    // Lire les filtres depuis l'URL de la page vidéo (?from_cat=xxx&from_sub=yyy)
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("from_cat");
    const sub = urlParams.get("from_sub");

    const returnParams = new URLSearchParams();
    if (cat) returnParams.set("cat", cat);
    if (sub) returnParams.set("sub", sub);
    const query = returnParams.toString();
    window.location.href = query ? `/?${query}` : "/";
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 mb-8 transition"
    >
      <ArrowLeft size={16} />
      Retour aux réalisations
    </button>
  );
}
