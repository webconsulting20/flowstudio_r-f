"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Settings, LayoutGrid } from "lucide-react";

interface SiteSettings {
  siteTitle: string;
  logoUrl: string;
}

export function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [settings, setSettings] = useState<SiteSettings>({ siteTitle: "Flow Studio", logoUrl: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <span className="text-lg font-bold tracking-widest uppercase">
                {settings.siteTitle || "Flow Studio"}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Portfolio</span>
            </Link>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 hidden sm:inline">
                {session?.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
