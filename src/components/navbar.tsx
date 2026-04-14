"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Settings, LayoutGrid, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

interface SiteSettings {
  siteTitle: string;
  logoUrl: string;
}

export function Navbar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "superadmin";
  const [settings, setSettings] = useState<SiteSettings>({ siteTitle: "Flow Studio", logoUrl: "" });
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => { try { sessionStorage.removeItem("portfolio-filters"); } catch {} }}>
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <span className="text-lg font-bold tracking-widest uppercase text-zinc-900 dark:text-zinc-100">
                {settings.siteTitle || "Flow Studio"}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Portfolio</span>
            </Link>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center justify-center p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            <div className="h-6 w-px bg-zinc-200 dark:bg-white/[0.08] mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 hidden sm:inline">
                {session?.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition"
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
