"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Users, Copy, Check, Eye, EyeOff,
  Settings2, ShieldCheck, Shield, User, Download, X, Save, KeyRound,
} from "lucide-react";

interface ClientUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "viewer";
  canDownload: boolean;
  passwordNote: string;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("viewer");
  const [canDownload, setCanDownload] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ email: string; password: string; role: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit modal
  const [editClient, setEditClient] = useState<ClientUser | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "viewer">("viewer");
  const [editCanDownload, setEditCanDownload] = useState(false);
  const [editPasswordNote, setEditPasswordNote] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaved, setEditSaved] = useState(false);

  useEffect(() => { loadClients(); }, []);

  function loadClients() {
    fetch("/api/clients").then((r) => r.json()).then((data) => {
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
      body: JSON.stringify({ email, name, password, role, canDownload }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      setSaving(false);
      return;
    }
    setCreated({ email, password, role });
    setName(""); setEmail(""); setPassword(""); setRole("viewer"); setCanDownload(false);
    setSaving(false); setShowForm(false);
    loadClients();
  }

  async function handleDelete(id: string, clientName: string) {
    if (!confirm(`Supprimer l'accès de "${clientName}" ?`)) return;
    setDeleting(id);
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  function openEdit(client: ClientUser) {
    setEditClient(client);
    setEditRole(client.role);
    setEditCanDownload(client.canDownload);
    setEditPasswordNote(client.passwordNote || "");
    setEditNewPassword("");
    setEditSaved(false);
  }

  async function handleEditSave() {
    if (!editClient) return;
    setEditSaving(true);
    const body: any = { role: editRole, canDownload: editCanDownload, passwordNote: editPasswordNote };
    if (editNewPassword) body.newPassword = editNewPassword;
    const res = await fetch(`/api/clients/${editClient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      setEditClient(updated);
      setEditNewPassword("");
      setEditSaved(true);
      setTimeout(() => setEditSaved(false), 2500);
    }
    setEditSaving(false);
  }

  function copyCredentials() {
    if (!created) return;
    const roleLabel = created.role === "admin" ? "Admin" : "Visiteur";
    const text = `Accès FLOW CLOUD\nEmail : ${created.email}\nMot de passe : ${created.password}\nRôle : ${roleLabel}\nLien : ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      {/* Edit modal */}
      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditClient(null)}>
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/[0.08] p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{editClient.name}</h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{editClient.email}</p>
              </div>
              <button onClick={() => setEditClient(null)} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Type d&apos;accès</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditRole("viewer")}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition text-left ${editRole === "viewer" ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-white/[0.05]" : "border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300"}`}
                >
                  <User size={16} className="text-zinc-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Visiteur</p>
                    <p className="text-xs text-zinc-400">Lecture seule</p>
                  </div>
                </button>
                <button
                  onClick={() => setEditRole("admin")}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition text-left ${editRole === "admin" ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/[0.08]" : "border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300"}`}
                >
                  <Shield size={16} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin</p>
                    <p className="text-xs text-zinc-400">Accès étendu</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Download toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/[0.03] rounded-xl border border-zinc-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Download size={16} className="text-zinc-500 dark:text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Téléchargement</p>
                  <p className="text-xs text-zinc-400">Autoriser à télécharger les vidéos</p>
                </div>
              </div>
              <button
                onClick={() => setEditCanDownload(!editCanDownload)}
                className={`relative w-11 h-6 rounded-full transition-colors ${editCanDownload ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editCanDownload ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Password note */}
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                <KeyRound size={13} className="inline mr-1.5" />
                Mot de passe noté
              </label>
              <input
                type="text"
                value={editPasswordNote}
                onChange={(e) => setEditPasswordNote(e.target.value)}
                placeholder="Mot de passe pour référence"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition"
              />
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Nouveau mot de passe <span className="text-zinc-400 font-normal">(optionnel)</span></label>
              <div className="relative">
                <input
                  type={showEditPassword ? "text" : "password"}
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Laisser vide pour ne pas changer"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition pr-10"
                />
                <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition">
                  {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href={`/admin/clients/${editClient.id}/access`}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 rounded-lg transition"
              >
                <Settings2 size={13} />
                Accès vidéos
              </Link>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 font-semibold rounded-xl transition text-sm"
              >
                {editSaving ? <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" /> : editSaved ? <Check size={15} className="text-emerald-500" /> : <Save size={15} />}
                {editSaved ? "Enregistré" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-6">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Accès</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gérez les accès à la plateforme</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setCreated(null); generatePassword(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded-xl transition"
          >
            <Plus size={18} /> Nouveau
          </button>
        </div>

        {/* Success */}
        {created && (
          <div className="mb-6 glass rounded-2xl p-5 border-emerald-500/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Accès créé avec succès</p>
                <div className="text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
                  <p>Email : <span className="text-zinc-900 dark:text-white font-mono">{created.email}</span></p>
                  <p>Mot de passe : <span className="text-zinc-900 dark:text-white font-mono">{created.password}</span></p>
                  <p>Rôle : <span className="text-zinc-900 dark:text-white">{created.role === "admin" ? "Admin" : "Visiteur"}</span></p>
                </div>
              </div>
              <button onClick={copyCredentials} className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg transition">
                {copied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 glass rounded-2xl p-6 space-y-4">
            {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Nom</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition"
                  placeholder="Nom du compte" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition"
                  placeholder="email@exemple.com" />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Type d&apos;accès</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole("viewer")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left ${role === "viewer" ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-white/[0.05]" : "border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300"}`}>
                  <User size={18} className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                  <div><p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Visiteur</p><p className="text-xs text-zinc-400">Lecture seule</p></div>
                </button>
                <button type="button" onClick={() => setRole("admin")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left ${role === "admin" ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-500/[0.08]" : "border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300"}`}>
                  <Shield size={18} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <div><p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin</p><p className="text-xs text-zinc-400">Accès étendu</p></div>
                </button>
              </div>
            </div>

            {/* Download toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/[0.03] rounded-xl border border-zinc-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Download size={16} className="text-zinc-500 dark:text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Téléchargement</p>
                  <p className="text-xs text-zinc-400">Autoriser à télécharger les vidéos</p>
                </div>
              </div>
              <button type="button" onClick={() => setCanDownload(!canDownload)}
                className={`relative w-11 h-6 rounded-full transition-colors ${canDownload ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${canDownload ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Mot de passe</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 transition pr-10 font-mono"
                    placeholder="Mot de passe" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button type="button" onClick={generatePassword} className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition whitespace-nowrap">
                  Générer
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition">Annuler</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 font-semibold rounded-xl transition">
                {saving ? <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" /> : <Plus size={16} />}
                Créer l&apos;accès
              </button>
            </div>
          </form>
        )}

        {/* Super Admin card */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">Super Admin</p>
          <div className="flex items-center justify-between px-5 py-4 glass rounded-xl border border-amber-200/50 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Admin Flow Cloud</p>
                <p className="text-xs text-zinc-500 font-mono">admin@flowcloud.fr</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <ShieldCheck size={11} /> Super Admin
            </span>
          </div>
        </div>

        {/* Client list */}
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-white/[0.03] animate-pulse" />)}</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl">
            <Users size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-zinc-500">Aucun accès créé</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">Comptes</p>
            <div className="space-y-2">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between px-5 py-4 glass rounded-xl group">
                  <button className="flex items-center gap-3 text-left hover:opacity-80 transition" onClick={() => openEdit(client)}>
                    <div>
                      <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:underline underline-offset-2">{client.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{client.email}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {/* Role badge */}
                    <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${client.role === "admin" ? "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400"}`}>
                      {client.role === "admin" ? <Shield size={11} /> : <User size={11} />}
                      {client.role === "admin" ? "Admin" : "Visiteur"}
                    </span>
                    {/* Download badge */}
                    {client.canDownload && (
                      <span className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <Download size={10} /> DL
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 dark:text-zinc-600 hidden md:inline">
                      {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(client.createdAt))}
                    </span>
                    <button
                      onClick={() => handleDelete(client.id, client.name)}
                      disabled={deleting === client.id}
                      className="p-2 text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
