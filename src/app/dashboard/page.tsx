"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Lock, Mail, LogOut, RefreshCw, Inbox,
  HardHat, CheckCircle2, Clock3, Images, Plus, Trash2,
} from "lucide-react";

/* ===== Types ===== */
type Demande = {
  id: string; name: string; company: string | null; email: string;
  phone: string | null; service: string | null; location: string | null;
  message: string; status: string; created_at: string;
};

type Projet = {
  id: string; titre: string; lieu: string | null;
  image_url: string; published: boolean; created_at: string;
};

const STATUTS = ["nouveau", "en_cours", "gagne", "perdu"];
const STATUT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  nouveau:  { label: "Nouveau",  color: "#FF6B00", bg: "rgba(255,107,0,0.12)" },
  en_cours: { label: "En cours", color: "#00F0FF", bg: "rgba(0,240,255,0.12)" },
  gagne:    { label: "Gagné",    color: "#25d366", bg: "rgba(37,211,102,0.12)" },
  perdu:    { label: "Perdu",    color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<"demandes" | "galerie">("demandes");

  // Demandes
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [filter, setFilter] = useState<string>("tous");

  // Galerie
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loadingProjets, setLoadingProjets] = useState(false);
  const [newTitre, setNewTitre] = useState("");
  const [newLieu, setNewLieu] = useState("");
  const [newImage, setNewImage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  /* ===== Session ===== */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* ===== Chargement demandes ===== */
  async function loadDemandes() {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("demandes").select("*").order("created_at", { ascending: false });
    if (!error && data) setDemandes(data as Demande[]);
    setLoadingData(false);
  }

  /* ===== Chargement projets ===== */
  async function loadProjets() {
    setLoadingProjets(true);
    const { data, error } = await supabase
      .from("projets").select("*").order("created_at", { ascending: false });
    if (!error && data) setProjets(data as Projet[]);
    setLoadingProjets(false);
  }

  useEffect(() => {
    if (session) { loadDemandes(); loadProjets(); }
  }, [session]);

  /* ===== Connexion / déconnexion ===== */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(""); setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Email ou mot de passe incorrect.");
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null); setDemandes([]); setProjets([]);
  }

  /* ===== Statut demande ===== */
  async function updateStatus(id: string, newStatus: string) {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    await supabase.from("demandes").update({ status: newStatus }).eq("id", id);
  }

  /* ===== Publier un projet ===== */
  async function publishProjet(e: React.FormEvent) {
    e.preventDefault();
    setPublishMsg("");
    if (!newTitre.trim() || !newImage.trim()) {
      setPublishMsg("⚠️ Le titre et le lien de l'image sont obligatoires.");
      return;
    }
    setPublishing(true);
    const { error } = await supabase.from("projets").insert({
      titre: newTitre.trim(),
      lieu: newLieu.trim() || null,
      image_url: newImage.trim(),
      published: true,
    });
    setPublishing(false);
    if (error) {
      setPublishMsg("❌ Erreur : " + error.message);
    } else {
      setPublishMsg("✅ Projet publié ! Il apparaît sur le site dans 1 minute.");
      setNewTitre(""); setNewLieu(""); setNewImage("");
      loadProjets();
    }
  }

  /* ===== Supprimer un projet ===== */
  async function deleteProjet(id: string) {
    setProjets((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("projets").delete().eq("id", id);
  }

  /* ===== Stats ===== */
  const stats = {
    total: demandes.length,
    nouveau: demandes.filter((d) => d.status === "nouveau").length,
    enCours: demandes.filter((d) => d.status === "en_cours").length,
    gagne: demandes.filter((d) => d.status === "gagne").length,
  };
  const filtered = filter === "tous" ? demandes : demandes.filter((d) => d.status === filter);

  /* ===== Écran chargement ===== */
  if (loadingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-onyx">
        <RefreshCw className="w-8 h-8 text-spark-orange animate-spin" />
      </main>
    );
  }

  /* ===== Écran connexion ===== */
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-onyx px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-spark-orange rounded-full blur-[200px] opacity-10" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-md glass-card p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-spark-orange/10 border border-spark-orange/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-spark-orange" />
            </div>
            <div>
              <h1 className="font-orbitron text-xl font-bold text-white">ESPACE ADMIN</h1>
              <p className="text-xs text-gray-500">NEW LOOK TECH — Accès restreint</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" placeholder="Email administrateur" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:border-spark-orange focus:outline-none transition-colors" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="password" placeholder="Mot de passe" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:border-spark-orange focus:outline-none transition-colors" />
            </div>
            {loginError && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg p-3">{loginError}</p>
            )}
            <button type="submit" disabled={loginLoading}
              className="w-full bg-spark-orange text-white font-bold py-3.5 rounded-lg hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loginLoading ? "Vérification..." : "Se connecter"}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  /* ===== LE COCKPIT ===== */
  return (
    <main className="min-h-screen bg-onyx px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-spark-orange/10 border border-spark-orange/30 flex items-center justify-center">
              <Bot className="w-6 h-6 text-spark-orange" />
            </div>
            <div>
              <h1 className="font-orbitron text-lg font-bold text-white">DASHBOARD NLTS</h1>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { loadDemandes(); loadProjets(); }}
              className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all" title="Rafraîchir">
              <RefreshCw className={`w-4 h-4 ${loadingData || loadingProjets ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all text-sm">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("demandes")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "demandes" ? "bg-spark-orange text-white shadow-lg shadow-orange-500/20" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
            📥 Demandes
          </button>
          <button onClick={() => setTab("galerie")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "galerie" ? "bg-cyan-electric text-onyx shadow-lg shadow-cyan-500/20" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
            🖼️ Galerie
          </button>
        </div>

        {/* ============ ONGLET DEMANDES ============ */}
        {tab === "demandes" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Inbox className="w-5 h-5" />} label="Total demandes" value={stats.total} color="#ffffff" delay={0} />
              <StatCard icon={<Clock3 className="w-5 h-5" />} label="Nouvelles" value={stats.nouveau} color="#FF6B00" delay={0.1} />
              <StatCard icon={<HardHat className="w-5 h-5" />} label="En cours" value={stats.enCours} color="#00F0FF" delay={0.2} />
              <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Gagnées" value={stats.gagne} color="#25d366" delay={0.3} />
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              <FilterBtn label="Tous" active={filter === "tous"} onClick={() => setFilter("tous")} />
              {STATUTS.map((s) => (
                <FilterBtn key={s} label={STATUT_STYLE[s].label} active={filter === s} onClick={() => setFilter(s)} />
              ))}
            </div>

            {loadingData ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-spark-orange animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Inbox className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p>Aucune demande dans cette catégorie.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="glass-card rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-bold text-white">{d.name}
                          {d.company && <span className="text-gray-500 font-normal"> — {d.company}</span>}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(d.created_at).toLocaleString("fr-FR")}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ color: STATUT_STYLE[d.status]?.color, background: STATUT_STYLE[d.status]?.bg }}>
                        {STATUT_STYLE[d.status]?.label || d.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400 mb-3">
                      {d.service && <span>🛠️ {d.service}</span>}
                      {d.location && <span>📍 {d.location}</span>}
                      {d.phone && <span>📞 {d.phone}</span>}
                      <span>📧 {d.email}</span>
                    </div>
                    <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-3 mb-4 italic">"{d.message}"</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-spark-orange">
                        {STATUTS.map((s) => (
                          <option key={s} value={s} className="bg-onyx">{STATUT_STYLE[s].label}</option>
                        ))}
                      </select>
                      <a href={`mailto:${d.email}?subject=${encodeURIComponent("NEW LOOK TECH — Votre demande de devis")}`}
                        className="px-3 py-2 rounded-lg bg-spark-orange/10 text-spark-orange text-xs font-bold hover:bg-spark-orange/20 transition-colors">✉️ Email</a>
                      {d.phone && (
                        <a href={`https://wa.me/${d.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors">💬 WhatsApp</a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ ONGLET GALERIE ============ */}
        {tab === "galerie" && (
          <>
            {/* Formulaire de publication */}
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h2 className="font-orbitron text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-electric" /> Publier un nouveau projet
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Ajoute d'abord ta photo dans GitHub (dossier public/images), puis référence-la ici.
              </p>
              <form onSubmit={publishProjet} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Titre du projet *</label>
                  <input type="text" value={newTitre} onChange={(e) => setNewTitre(e.target.value)}
                    placeholder="Ex : Portail métallique duplex"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Lieu</label>
                  <input type="text" value={newLieu} onChange={(e) => setNewLieu(e.target.value)}
                    placeholder="Ex : Kolwezi, Lualaba"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Chemin de l'image *</label>
                  <input type="text" value={newImage} onChange={(e) => setNewImage(e.target.value)}
                    placeholder="/images/projet-4.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                {publishMsg && (
                  <p className={`text-xs rounded-lg p-3 ${publishMsg.startsWith("✅") ? "text-green-300 bg-green-400/10 border border-green-400/20" : "text-yellow-300 bg-yellow-400/10 border border-yellow-400/20"}`}>
                    {publishMsg}
                  </p>
                )}
                <button type="submit" disabled={publishing}
                  className="bg-cyan-electric text-onyx font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
                  {publishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {publishing ? "Publication..." : "Publier le projet"}
                </button>
              </form>
            </div>

            {/* Liste des projets publiés */}
            <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Images className="w-4 h-4 text-spark-orange" /> Projets publiés ({projets.length})
            </h3>
            {loadingProjets ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-spark-orange animate-spin" /></div>
            ) : projets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Images className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm">Aucun projet dans la base. Le site affiche les projets par défaut.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projets.map((p) => (
                  <div key={p.id} className="glass-card rounded-2xl overflow-hidden">
                    <div className="relative h-40 bg-black/40">
                      <img src={p.image_url} alt={p.titre} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white text-sm">{p.titre}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{p.lieu || "Lieu non précisé"}</p>
                      <p className="text-[10px] text-gray-600 mt-1">{p.image_url}</p>
                      <button onClick={() => deleteProjet(p.id)}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/* ===== Composants secondaires ===== */
function StatCard({ icon, label, value, color, delay }: {
  icon: React.ReactNode; label: string; value: number; color: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <p className="font-orbitron text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
        active ? "bg-spark-orange text-white shadow-lg shadow-orange-500/20"
        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
      {label}
    </button>
  );
}
