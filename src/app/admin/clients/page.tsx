"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Users, Copy, Check, Eye, EyeOff,
} from "lucide-react";

interface ClientUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  function loadClients() {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      });
  }

  function generatePassword() {
    const chars = "abcdefghijkmnpqrstuvwxyz23456789";
    let pw = "";
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pw);
    setShowPassword(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      setSaving(false);
      return;
    }

    setCreated({ email, password });
    setName("");
    setEmail("");
    setPassword("");
    setSaving(false);
    setShowForm(false);
    loadClients();
  }

  async function handleDelete(id: string, clientName: string) {
    if (!confirm(`Supprimer l'accès de "${clientName}" ?`)) return;
    setDeleting(id);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  function copyCredentials() {
    if (!created) return;
    const text = `Accès FLOW CLOUD\nEmail : ${created.email}\nMot de passe : ${created.password}\nLien : ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition mb-6"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accès clients</h1>
            <p className="text-zinc-500 mt-1">Créez des comptes pour vos clients</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setCreated(null);
              generatePassword();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition"
          >
            <Plus size={18} />
            Nouveau
          </button>
        </div>

        {/* Success message */}
        {created && (
          <div className="mb-6 glass rounded-2xl p-5 border border-emerald-500/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-400 mb-2">Accès créé avec succès</p>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>Email : <span className="text-white font-mono">{created.email}</span></p>
                  <p>Mot de passe : <span className="text-white font-mono">{created.password}</span></p>
                </div>
              </div>
              <button
                onClick={copyCredentials}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 glass rounded-2xl p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
                  placeholder="client@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Mot de passe</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition pr-10 font-mono"
                    placeholder="Mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/[0.06] rounded-xl text-zinc-400 hover:text-white transition whitespace-nowrap"
                >
                  Générer
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm text-zinc-400 hover:text-white transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-100 disabled:opacity-50 text-zinc-900 font-semibold rounded-xl transition"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Créer l&apos;accès
              </button>
            </div>
          </form>
        )}

        {/* Client list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl">
            <Users size={40} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500">Aucun accès client créé</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between px-5 py-4 glass rounded-xl"
              >
                <div>
                  <p className="font-medium text-sm">{client.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{client.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600 hidden sm:inline">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(client.createdAt))}
                  </span>
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    disabled={deleting === client.id}
                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
