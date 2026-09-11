"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Lock, Mail, LogOut, RefreshCw, Inbox,
  HardHat, Users, TrendingUp, CheckCircle2, Clock3, XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */
type Demande = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  service: string | null;
  location: string | null;
  message: string;
  status: string;
  created_at: string;
};

const STATUTS = ["nouveau", "en_cours", "gagne", "perdu"];

const STATUT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  nouveau:  { label: "Nouveau",  color: "#FF6B00", bg: "rgba(255,107,0,0.12)" },
  en_cours: { label: "En cours", color: "#00F0FF", bg: "rgba(0,240,255,0.12)" },
  gagne:    { label: "Gagné",    color: "#25d366", bg: "rgba(37,211,102,0.12)" },
  perdu:    { label: "Perdu",    color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */
export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [filter, setFilter] = useState<string>("tous");

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

  /* ===== Charger les demandes ===== */
  async function loadDemandes() {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("demandes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDemandes(data as Demande[]);
    setLoadingData(false);
  }

  useEffect(() => {
    if (session) loadDemandes();
  }, [session]);

  /* ===== Connexion ===== */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Email ou mot de passe incorrect.");
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setDemandes([]);
  }

  /* ===== Changer statut ===== */
  async function updateStatus(id: string, newStatus: string) {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    await supabase.from("demandes").update({ status: newStatus }).eq("id", id);
  }

  /* ===== Stats ===== */
  const stats = {
    total: demandes.length,
    nouveau: demandes.filter((d) => d.status === "nouveau").length,
    enCours: demandes.filter((d) => d.status === "en_cours").length,
    gagne: demandes.filter((d) => d.status === "gagne").length,
  };

  const filtered = filter === "tous" ? demandes : demandes.filter((d) => d.status === filter);

  /* =========================================================
     ÉCRAN DE CHARGEMENT DE SESSION
  ========================================================= */
  if (loadingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-onyx">
        <RefreshCw className="w-8 h-8 text-spark-orange animate-spin" />
      </main>
    );
  }

  /* =========================================================
     ÉCRAN DE CONNEXION (la porte blindée)
  ========================================================= */
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-onyx px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-spark-orange rounded-full blur-[200px] opacity-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-md glass-card p-8 rounded-2xl"
        >
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
              <input
                type="email"
                placeholder="Email administrateur"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:border-spark-orange focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:border-spark-orange focus:outline-none transition-colors"
              />
            </div>

            {loginError && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-spark-orange text-white font-bold py-3.5 rounded-lg hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loginLoading ? "Vérification..." : "Se connecter"}
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  /* =========================================================
     LE COCKPIT (une fois connecté)
  ========================================================= */
  return (
    <main className="min-h-screen bg-onyx px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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
            <button
              onClick={loadDemandes}
              className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Inbox className="w-5 h-5" />} label="Total demandes" value={stats.total} color="#ffffff" delay={0} />
          <StatCard icon={<Clock3 className="w-5 h-5" />} label="Nouvelles" value={stats.nouveau} color="#FF6B00" delay={0.1} />
          <StatCard icon={<HardHat className="w-5 h-5" />} label="En cours" value={stats.enCours} color="#00F0FF" delay={0.2} />
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Gagnées" value={stats.gagne} color="#25d366" delay={0.3} />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <FilterBtn label="Tous" active={filter === "tous"} onClick={() => setFilter("tous")} />
          {STATUTS.map((s) => (
            <FilterBtn key={s} label={STATUT_STYLE[s].label} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </div>

        {/* Liste des demandes */}
        {loadingData ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 text-spark-orange animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Inbox className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>Aucune demande dans cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-white">
                        {d.name}
                        {d.company && <span className="text-gray-500 font-normal"> — {d.company}</span>}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(d.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ color: STATUT_STYLE[d.status]?.color, background: STATUT_STYLE[d.status]?.bg }}
                    >
                      {STATUT_STYLE[d.status]?.label || d.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400 mb-3">
                    {d.service && <span>🛠️ {d.service}</span>}
                    {d.location && <span>📍 {d.location}</span>}
                    {d.phone && <span>📞 {d.phone}</span>}
                    <span>📧 {d.email}</span>
                  </div>

                  <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-3 mb-4 italic">
                    "{d.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Changer statut */}
                    <select
                      value={d.status}
                      onChange={(e) => updateStatus(d.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-spark-orange"
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s} className="bg-onyx">{STATUT_STYLE[s].label}</option>
                      ))}
                    </select>

                    {/* Actions rapides */}
                    {d.email && (
                      <a
                        href={`mailto:${d.email}?subject=${encodeURIComponent("NEW LOOK TECH — Votre demande de devis")}`}
                        className="px-3 py-2 rounded-lg bg-spark-orange/10 text-spark-orange text-xs font-bold hover:bg-spark-orange/20 transition-colors"
                      >
                        ✉️ Email
                      </a>
                    )}
                    {d.phone && (
                      <a
                        href={`https://wa.me/${d.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   COMPOSANTS SECONDAIRES
========================================================= */
function StatCard({ icon, label, value, color, delay }: {
  icon: React.ReactNode; label: string; value: number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-5"
    >
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
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
        active
          ? "bg-spark-orange text-white shadow-lg shadow-orange-500/20"
          : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
