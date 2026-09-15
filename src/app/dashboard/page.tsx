"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Lock, Mail, LogOut, RefreshCw, Inbox,
  HardHat, CheckCircle2, Clock3, Images, Plus, Trash2,
  ArrowUp, ArrowDown, Pencil, Save, X, TrendingUp, Eye,
  FileText, Newspaper, Users, Phone, Building2, Wallet,
  ArrowRight, DollarSign, CalendarDays,
} from "lucide-react";

/* ===== Types ===== */
type Demande = {
  id: string; name: string; company: string | null; email: string;
  phone: string | null; service: string | null; location: string | null;
  message: string; status: string; created_at: string;
  client_id?: string | null;
};

type Projet = {
  id: string; titre: string; lieu: string | null;
  image_url: string; published: boolean; ordre: number | null;
  created_at: string;
};

type Article = {
  id: string; slug: string; titre: string; extrait: string | null;
  contenu: string; published: boolean; created_at: string;
};

type Client = {
  id: string; name: string; company: string | null; email: string;
  phone: string | null; service_prefere: string | null;
  first_demande_date: string; created_at: string;
  nb_demandes: number; nb_gagnees: number; nb_en_cours: number;
};

type Chantier = {
  id: string; client_id: string | null; titre: string; description: string | null;
  budget_estime_usd: number | null; budget_reel_usd: number | null;
  budget_estime_cdf: number | null; budget_reel_cdf: number | null;
  devise_principale: string; statut: string;
  date_debut: string | null; date_fin_prevue: string | null; date_fin_reelle: string | null;
  assigne_a: string | null; created_at: string;
  client_name?: string;
};

type Paiement = {
  id: string; chantier_id: string; montant: number; devise: string;
  moyen: string | null; note: string | null; date_paiement: string;
  chantier_titre?: string;
};

const STATUTS = ["nouveau", "en_cours", "gagne", "perdu"];
const STATUT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  nouveau:  { label: "Nouveau",  color: "#FF6B00", bg: "rgba(255,107,0,0.12)" },
  en_cours: { label: "En cours", color: "#00F0FF", bg: "rgba(0,240,255,0.12)" },
  gagne:    { label: "Gagné",    color: "#25d366", bg: "rgba(37,211,102,0.12)" },
  perdu:    { label: "Perdu",    color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const CHANTIER_STATUTS = ["devis_envoye", "negociation", "signe", "en_cours", "livre", "solde"];
const CHANTIER_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  devis_envoye: { label: "Devis envoyé", color: "#FF6B00", bg: "rgba(255,107,0,0.12)" },
  negotiation:  { label: "Négociation", color: "#FFD700", bg: "rgba(255,215,0,0.12)" },
  signe:        { label: "Signé",       color: "#00F0FF", bg: "rgba(0,240,255,0.12)" },
  en_cours:     { label: "En cours",    color: "#7c5cff", bg: "rgba(124,92,255,0.12)" },
  livre:        { label: "Livré",       color: "#25d366", bg: "rgba(37,211,102,0.12)" },
  solde:        { label: "Soldé",       color: "#888888", bg: "rgba(136,136,136,0.12)" },
};

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<"demandes" | "clients" | "chantiers" | "finances" | "galerie" | "blog">("demandes");

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

  // Édition projets
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState("");
  const [editLieu, setEditLieu] = useState("");
  const [editImage, setEditImage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Stats visites
  const [visitStats, setVisitStats] = useState({ total: 0, last30: 0, last7: 0 });
  const [loadingVisits, setLoadingVisits] = useState(false);

  // Blog
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [newArticleTitre, setNewArticleTitre] = useState("");
  const [newArticleExtrait, setNewArticleExtrait] = useState("");
  const [newArticleContenu, setNewArticleContenu] = useState("");
  const [publishingArticle, setPublishingArticle] = useState(false);
  const [articleMsg, setArticleMsg] = useState("");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editArticleTitre, setEditArticleTitre] = useState("");
  const [editArticleExtrait, setEditArticleExtrait] = useState("");
  const [editArticleContenu, setEditArticleContenu] = useState("");
  const [savingArticleEdit, setSavingArticleEdit] = useState(false);

  // Clients
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Chantiers
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [loadingChantiers, setLoadingChantiers] = useState(false);
  const [chantierFilter, setChantierFilter] = useState<string>("tous");

  // Création chantier (depuis demande gagnée ou manuel)
  const [createModal, setCreateModal] = useState<{ demande?: Demande } | null>(null);
  const [chTitre, setChTitre] = useState("");
  const [chDescription, setChDescription] = useState("");
  const [chClientId, setChClientId] = useState<string>("");
  const [chDevise, setChDevise] = useState("USD");
  const [chBudgetEstime, setChBudgetEstime] = useState("");
  const [chAssigneeA, setChAssigneeA] = useState("Ir Héritier");
  const [chDateFin, setChDateFin] = useState("");
  const [creatingChantier, setCreatingChantier] = useState(false);
  const [chantierMsg, setChantierMsg] = useState("");

  // Finances (paiements)
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loadingPaiements, setLoadingPaiements] = useState(false);
  const [payModal, setPayModal] = useState<Chantier | null>(null);
  const [payMontant, setPayMontant] = useState("");
  const [payDevise, setPayDevise] = useState("USD");
  const [payMoyen, setPayMoyen] = useState("cash");
  const [payNote, setPayNote] = useState("");
  const [savingPay, setSavingPay] = useState(false);
  const [payMsg, setPayMsg] = useState("");

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

  /* ===== Chargements ===== */
  async function loadDemandes() {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("demandes").select("*").order("created_at", { ascending: false });
    if (!error && data) setDemandes(data as Demande[]);
    setLoadingData(false);
  }

  async function loadProjets() {
    setLoadingProjets(true);
    const { data, error } = await supabase
      .from("projets").select("*").order("ordre", { ascending: true }).order("created_at", { ascending: false });
    if (!error && data) setProjets(data as Projet[]);
    setLoadingProjets(false);
  }

  async function loadVisits() {
    setLoadingVisits(true);
    try {
      const res = await fetch("/api/visites");
      if (res.ok) setVisitStats(await res.json());
    } catch { /* silencieux */ }
    setLoadingVisits(false);
  }

  async function loadArticles() {
    setLoadingArticles(true);
    const { data, error } = await supabase
      .from("articles").select("*").order("created_at", { ascending: false });
    if (!error && data) setArticles(data as Article[]);
    setLoadingArticles(false);
  }

  async function loadClients() {
    setLoadingClients(true);
    try {
      const res = await fetch("/api/clients");
      if (res.ok) setClients(Array.isArray(await res.json()) ? await res.json() : []);
    } catch { /* silencieux */ }
    setLoadingClients(false);
  }

  async function loadChantiers() {
    setLoadingChantiers(true);
    try {
      const res = await fetch("/api/chantiers");
      if (res.ok) setChantiers(await res.json());
    } catch { /* silencieux */ }
    setLoadingChantiers(false);
  }

  async function loadPaiements() {
    setLoadingPaiements(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;
      const res = await fetch(
        `${supabaseUrl}/rest/v1/paiements?select=*,chantiers(titre)&order=date_paiement.desc`,
        {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setPaiements(data.map((p: any) => ({
          ...p,
          chantier_titre: p.chantiers?.titre || "Chantier supprimé",
        })));
      }
    } catch { /* silencieux */ }
    setLoadingPaiements(false);
  }

  useEffect(() => {
    if (session) { loadDemandes(); loadProjets(); loadVisits(); loadArticles(); loadClients(); loadChantiers(); loadPaiements(); }
  }, [session]);

  /* ===== Connexion ===== */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(""); setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Email ou mot de passe incorrect.");
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null); setDemandes([]); setProjets([]); setArticles([]); setClients([]); setChantiers([]); setPaiements([]);
  }

  /* ===== Statut demande ===== */
  async function updateStatus(id: string, newStatus: string) {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    await supabase.from("demandes").update({ status: newStatus }).eq("id", id);
    loadClients();
  }

  /* ===== CRÉER UN CHANTIER ===== */
  function openCreateModal(demande?: Demande) {
    // Trouver le client lié si une demande est fournie
    let clientId = "";
    let titreSuggere = "";
    if (demande) {
      const client = clients.find(
        (c) => c.email.toLowerCase() === demande.email.toLowerCase()
      );
      if (client) clientId = client.id;
      titreSuggere = demande.service ? `${demande.service} — ${demande.name}` : `Projet ${demande.name}`;
    }
    setCreateModal({ demande });
    setChTitre(titreSuggere);
    setChDescription(demande?.message || "");
    setChClientId(clientId);
    setChDevise("USD");
    setChBudgetEstime("");
    setChAssigneeA("Ir Héritier");
    setChDateFin("");
    setChantierMsg("");
  }

  async function createChantier(e: React.FormEvent) {
    e.preventDefault();
    setChantierMsg("");
    if (!chTitre.trim()) {
      setChantierMsg("⚠️ Le titre est obligatoire.");
      return;
    }
    setCreatingChantier(true);

    const payload: any = {
      titre: chTitre.trim(),
      description: chDescription.trim() || null,
      client_id: chClientId || null,
      devise_principale: chDevise,
      statut: "devis_envoye",
      assigne_a: chAssigneeA.trim() || null,
      date_fin_prevue: chDateFin || null,
    };
    if (chBudgetEstime) {
      if (chDevise === "USD") payload.budget_estime_usd = parseFloat(chBudgetEstime);
      else payload.budget_estime_cdf = parseFloat(chBudgetEstime);
    }

    const { error } = await supabase.from("chantiers").insert(payload);
    setCreatingChantier(false);

    if (error) {
      setChantierMsg("❌ Erreur : " + error.message);
    } else {
      setChantierMsg("✅ Chantier créé !");
      setCreateModal(null);
      loadChantiers();
    }
  }

  /* ===== Changer statut chantier ===== */
  async function updateChantierStatut(id: string, newStatut: string) {
    setChantiers((prev) => prev.map((c) => (c.id === id ? { ...c, statut: newStatut } : c)));
    const update: any = { statut: newStatut };
    if (newStatut === "livre" || newStatut === "solde") {
      update.date_fin_reelle = new Date().toISOString().slice(0, 10);
    }
    await supabase.from("chantiers").update(update).eq("id", id);
  }

  /* ===== Supprimer chantier ===== */
  async function deleteChantier(id: string) {
    setChantiers((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("chantiers").delete().eq("id", id);
    loadPaiements();
  }

  /* ===== Ajouter un paiement ===== */
  async function addPaiement(e: React.FormEvent) {
    e.preventDefault();
    setPayMsg("");
    if (!payModal || !payMontant) {
      setPayMsg("⚠️ Montant obligatoire.");
      return;
    }
    setSavingPay(true);
    const { error } = await supabase.from("paiements").insert({
      chantier_id: payModal.id,
      montant: parseFloat(payMontant),
      devise: payDevise,
      moyen: payMoyen,
      note: payNote.trim() || null,
    });
    setSavingPay(false);
    if (error) {
      setPayMsg("❌ Erreur : " + error.message);
    } else {
      setPayMsg("");
      setPayModal(null);
      setPayMontant(""); setPayNote("");
      loadPaiements();
      loadChantiers();
    }
  }

  /* ===== Supprimer paiement ===== */
  async function deletePaiement(id: string) {
    setPaiements((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("paiements").delete().eq("id", id);
    loadChantiers();
  }

  /* ===== Supprimer un article ===== */
  async function deleteArticle(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    await supabase.from("articles").delete().eq("id", id);
  }

  /* ===== Blog fonctions ===== */
  function generateSlug(titre: string): string {
    return titre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
  }

  async function publishArticle(e: React.FormEvent) {
    e.preventDefault();
    setArticleMsg("");
    if (!newArticleTitre.trim() || !newArticleContenu.trim()) {
      setArticleMsg("⚠️ Le titre et le contenu sont obligatoires.");
      return;
    }
    setPublishingArticle(true);
    const slug = generateSlug(newArticleTitre);
    const { error } = await supabase.from("articles").insert({
      slug, titre: newArticleTitre.trim(),
      extrait: newArticleExtrait.trim() || null,
      contenu: newArticleContenu.trim(), published: true,
    });
    setPublishingArticle(false);
    if (error) {
      setArticleMsg(error.message.includes("duplicate")
        ? "❌ Titre similaire existe déjà." : "❌ Erreur : " + error.message);
    } else {
      setArticleMsg("✅ Article publié ! Visible sur /blog dans 1 minute. 🎉");
      setNewArticleTitre(""); setNewArticleExtrait(""); setNewArticleContenu("");
      loadArticles();
    }
  }

  function startEditArticle(a: Article) {
    setEditingArticleId(a.id); setEditArticleTitre(a.titre);
    setEditArticleExtrait(a.extrait || ""); setEditArticleContenu(a.contenu);
  }

  async function saveArticleEdit() {
    if (!editingArticleId || !editArticleTitre.trim() || !editArticleContenu.trim()) return;
    setSavingArticleEdit(true);
    await supabase.from("articles").update({
      titre: editArticleTitre.trim(), extrait: editArticleExtrait.trim() || null,
      contenu: editArticleContenu.trim(),
    }).eq("id", editingArticleId);
    setSavingArticleEdit(false); setEditingArticleId(null); loadArticles();
  }

  /* ===== Projet fonctions ===== */
  async function publishProjet(e: React.FormEvent) {
    e.preventDefault();
    setPublishMsg("");
    if (!newTitre.trim() || !newImage.trim()) {
      setPublishMsg("⚠️ Le titre et le lien de l'image sont obligatoires.");
      return;
    }
    setPublishing(true);
    const minOrdre = projets.length > 0 ? Math.min(...projets.map(p => p.ordre ?? 0)) : 0;
    const { error } = await supabase.from("projets").insert({
      titre: newTitre.trim(), lieu: newLieu.trim() || null,
      image_url: newImage.trim(), published: true, ordre: minOrdre - 1,
    });
    setPublishing(false);
    if (error) setPublishMsg("❌ Erreur : " + error.message);
    else {
      setPublishMsg("✅ Projet publié ! Visible dans 1 minute.");
      setNewTitre(""); setNewLieu(""); setNewImage(""); loadProjets();
    }
  }

  async function deleteProjet(id: string) {
    setProjets((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("projets").delete().eq("id", id);
  }

  async function moveProjet(id: string, direction: "up" | "down") {
    const sorted = [...projets].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
    const index = sorted.findIndex((p) => p.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const current = sorted[index], target = sorted[targetIndex];
    const co = current.ordre ?? 0, to = target.ordre ?? 0;
    setProjets((prev) => prev.map((p) => {
      if (p.id === current.id) return { ...p, ordre: to };
      if (p.id === target.id) return { ...p, ordre: co };
      return p;
    }));
    await supabase.from("projets").update({ ordre: to }).eq("id", current.id);
    await supabase.from("projets").update({ ordre: co }).eq("id", target.id);
  }

  function startEdit(p: Projet) {
    setEditingId(p.id); setEditTitre(p.titre); setEditLieu(p.lieu || ""); setEditImage(p.image_url);
  }

  async function saveEdit() {
    if (!editingId || !editTitre.trim() || !editImage.trim()) return;
    setSavingEdit(true);
    await supabase.from("projets").update({
      titre: editTitre.trim(), lieu: editLieu.trim() || null, image_url: editImage.trim(),
    }).eq("id", editingId);
    setSavingEdit(false); setEditingId(null); loadProjets();
  }

  /* ===== Stats ===== */
  const stats = {
    total: demandes.length,
    nouveau: demandes.filter((d) => d.status === "nouveau").length,
    enCours: demandes.filter((d) => d.status === "en_cours").length,
    gagne: demandes.filter((d) => d.status === "gagne").length,
  };
  const filtered = filter === "tous" ? demandes : demandes.filter((d) => d.status === filter);

  /* ===== Finances calculées ===== */
  const finances = {
    totalEncaisseUSD: paiements.filter(p => p.devise === "USD").reduce((s, p) => s + p.montant, 0),
    totalEncaisseCDF: paiements.filter(p => p.devise === "CDF").reduce((s, p) => s + p.montant, 0),
    chantiersActifs: chantiers.filter(c => c.statut === "en_cours").length,
    chantiersSoldes: chantiers.filter(c => c.statut === "solde").length,
    // Impayés = chantiers signés/en_cours/livrés dont le budget estime > paiements reçus
    impayes: chantiers
      .filter(c => ["signe", "en_cours", "livre"].includes(c.statut))
      .map(c => {
        const budget = c.devise_principale === "CDF" ? (c.budget_estime_cdf ?? 0) : (c.budget_estime_usd ?? 0);
        const paye = paiements
          .filter(p => p.chantier_id === c.id && p.devise === c.devise_principale)
          .reduce((s, p) => s + p.montant, 0);
        return { titre: c.titre, devise: c.devise_principale, reste: budget - paye };
      })
      .filter(x => x.reste > 0),
  };
  const filteredChantiers = chantierFilter === "tous" ? chantiers : chantiers.filter((c) => c.statut === chantierFilter);

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
            <button onClick={() => { loadDemandes(); loadProjets(); loadVisits(); loadArticles(); loadClients(); loadChantiers(); loadPaiements(); }}
              className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all" title="Rafraîchir tout">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all text-sm">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "demandes", label: "📥 Demandes" },
            { key: "clients", label: "👥 Clients" },
            { key: "chantiers", label: "🏗️ Chantiers" },
            { key: "finances", label: "💰 Finances" },
            { key: "galerie", label: "🖼️ Galerie" },
            { key: "blog", label: "📝 Blog" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.key ? "bg-spark-orange text-white shadow-lg shadow-orange-500/20" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ============ ONGLET DEMANDES ============ */}
        {tab === "demandes" && (
          <>
            <div className="glass-card rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-electric" />
                <h2 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider">Trafic du site</h2>
                <button onClick={loadVisits} disabled={loadingVisits} className="ml-auto p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loadingVisits ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 mb-1"><Eye className="w-3 h-3" /> 7 jours</div>
                  <p className="font-orbitron text-2xl font-bold text-cyan-electric">{visitStats.last7}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 mb-1"><Eye className="w-3 h-3" /> 30 jours</div>
                  <p className="font-orbitron text-2xl font-bold text-white">{visitStats.last30}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 mb-1"><Eye className="w-3 h-3" /> Total</div>
                  <p className="font-orbitron text-2xl font-bold text-spark-orange">{visitStats.total}</p>
                </div>
              </div>
            </div>

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
                      {/* BOUTON MAGIQUE : créer chantier depuis une demande gagnée */}
                      {d.status === "gagne" && (
                        <button onClick={() => openCreateModal(d)}
                          className="px-3 py-2 rounded-lg bg-cyan-electric/15 text-cyan-electric text-xs font-bold hover:bg-cyan-electric/25 transition-colors flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> Créer un chantier
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ ONGLET CLIENTS ============ */}
        {tab === "clients" && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass-card rounded-2xl p-5 text-center">
                <Users className="w-5 h-5 text-white mx-auto mb-2" />
                <p className="font-orbitron text-3xl font-bold text-white">{clients.length}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Clients totaux</p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="font-orbitron text-3xl font-bold text-green-400">{clients.filter((c) => c.nb_gagnees > 0).length}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Clients actifs</p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center">
                <Clock3 className="w-5 h-5 text-cyan-electric mx-auto mb-2" />
                <p className="font-orbitron text-3xl font-bold text-cyan-electric">{clients.filter((c) => c.nb_en_cours > 0).length}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">En négociation</p>
              </div>
            </div>

            <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-spark-orange" /> Fiches clients ({clients.length})
            </h3>
            {loadingClients ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-spark-orange animate-spin" /></div>
            ) : clients.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm">Les fiches clients se créent automatiquement depuis les demandes de devis.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {clients.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} className="glass-card rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white">{c.name}</h3>
                        {c.company && <p className="text-xs text-gray-500">{c.company}</p>}
                      </div>
                      {c.nb_demandes >= 2 && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-spark-orange/15 text-spark-orange">⭐ Fidèle</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="font-orbitron text-lg font-bold text-white">{c.nb_demandes}</p>
                        <p className="text-[9px] uppercase text-gray-500">Demandes</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="font-orbitron text-lg font-bold text-green-400">{c.nb_gagnees}</p>
                        <p className="text-[9px] uppercase text-gray-500">Gagnées</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="font-orbitron text-lg font-bold text-cyan-electric">{c.nb_en_cours}</p>
                        <p className="text-[9px] uppercase text-gray-500">En cours</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-400 mb-4">
                      <p className="truncate">📧 {c.email}</p>
                      {c.phone && <p>📞 {c.phone}</p>}
                      <p className="text-xs text-gray-600">📅 Client depuis le {new Date(c.first_demande_date || c.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href={`mailto:${c.email}?subject=${encodeURIComponent("NEW LOOK TECH — Suivi de votre projet")}`}
                        className="px-3 py-2 rounded-lg bg-spark-orange/10 text-spark-orange text-xs font-bold hover:bg-spark-orange/20 transition-colors">✉️ Email</a>
                      {c.phone && (
                        <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors">💬 WhatsApp</a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ ONGLET CHANTIERS ============ */}
        {tab === "chantiers" && (
          <>
            {/* Bouton créer manuellement */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-spark-orange" /> Chantiers ({chantiers.length})
              </h3>
              <button onClick={() => openCreateModal()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-electric text-onyx font-bold text-sm hover:opacity-90 transition-all">
                <Plus className="w-4 h-4" /> Nouveau chantier
              </button>
            </div>

            {/* Filtres statuts chantiers */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              <FilterBtn label="Tous" active={chantierFilter === "tous"} onClick={() => setChantierFilter("tous")} />
              {CHANTIER_STATUTS.map((s) => (
                <FilterBtn key={s} label={CHANTIER_STYLE[s].label} active={chantierFilter === s} onClick={() => setChantierFilter(s)} />
              ))}
            </div>

            {loadingChantiers ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-spark-orange animate-spin" /></div>
            ) : filteredChantiers.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm mb-2">Aucun chantier {chantierFilter !== "tous" ? "dans ce statut" : "pour l'instant"}.</p>
                <p className="text-xs text-gray-600">
                  💡 Marque une demande comme "Gagnée" dans l'onglet Demandes, puis clique "Créer un chantier" !
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChantiers.map((c, i) => {
                  const client = clients.find((cl) => cl.id === c.client_id);
                  const budget = c.devise_principale === "CDF" ? c.budget_estime_cdf : c.budget_estime_usd;
                  const paye = paiements.filter((p) => p.chantier_id === c.id && p.devise === c.devise_principale).reduce((s, p) => s + p.montant, 0);
                  const reste = (budget ?? 0) - paye;
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }} className="glass-card rounded-2xl p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white">{c.titre}</h3>
                          {client && <p className="text-xs text-gray-500">👤 {client.name}{client.company ? ` — ${client.company}` : ""}</p>}
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                          style={{ color: CHANTIER_STYLE[c.statut]?.color, background: CHANTIER_STYLE[c.statut]?.bg }}>
                          {CHANTIER_STYLE[c.statut]?.label || c.statut}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400 mb-3">
                        {c.assigne_a && <span>👷 {c.assigne_a}</span>}
                        {c.date_fin_prevue && <span>📅 Échéance : {new Date(c.date_fin_prevue).toLocaleDateString("fr-FR")}</span>}
                        {c.devise_principale === "CDF" ? (
                          <span>💰 Budget : {c.budget_estime_cdf?.toLocaleString("fr-FR")} CDF</span>
                        ) : (
                          budget ? <span>💰 Budget : {budget.toLocaleString("fr-FR")} $</span> : null
                        )}
                      </div>

                      {/* Barre de progression paiement */}
                      {budget && budget > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Encaissé : {paye.toLocaleString("fr-FR")} {c.devise_principale}</span>
                            <span className={reste > 0 ? "text-red-400" : "text-green-400"}>
                              {reste > 0 ? `Reste : ${reste.toLocaleString("fr-FR")} ${c.devise_principale}` : "✅ Soldé"}
                            </span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-spark-orange to-cyan-electric rounded-full"
                              style={{ width: `${Math.min(100, (paye / budget) * 100)}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <select value={c.statut} onChange={(e) => updateChantierStatut(c.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-spark-orange">
                          {CHANTIER_STATUTS.map((s) => (
                            <option key={s} value={s} className="bg-onyx">{CHANTIER_STYLE[s].label}</option>
                          ))}
                        </select>
                        <button onClick={() => { setPayModal(c); setPayDevise(c.devise_principale); setPayMontant(""); setPayNote(""); }}
                          className="px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5" /> Encaisser
                        </button>
                        <button onClick={() => deleteChantier(c.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ============ ONGLET FINANCES ============ */}
        {tab === "finances" && (
          <>
            {/* Cartes finances */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<DollarSign className="w-5 h-5" />} label="Encaissé USD" value={finances.totalEncaisseUSD} color="#25d366" delay={0} />
              <StatCard icon={<Wallet className="w-5 h-5" />} label="Encaissé CDF" value={finances.totalEncaisseCDF} color="#00F0FF" delay={0.1} />
              <StatCard icon={<Building2 className="w-5 h-5" />} label="Chantiers actifs" value={finances.chantiersActifs} color="#7c5cff" delay={0.2} />
              <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Chantiers soldés" value={finances.chantiersSoldes} color="#ffffff" delay={0.3} />
            </div>

            {/* Impayés */}
            <div className="glass-card rounded-2xl p-5 mb-8">
              <h2 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-red-400" /> Impayés à suivre
              </h2>
              {finances.impayes.length === 0 ? (
                <p className="text-sm text-gray-500">✅ Aucun impayé. Tous les chantiers en cours sont à jour !</p>
              ) : (
                <div className="space-y-2">
                  {finances.impayes.map((imp, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-400/5 border border-red-400/20 rounded-lg p-3">
                      <span className="text-sm text-gray-300">{imp.titre}</span>
                      <span className="font-orbitron font-bold text-red-300">
                        {imp.reste.toLocaleString("fr-FR")} {imp.devise}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historique paiements */}
            <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-spark-orange" /> Historique des paiements ({paiements.length})
            </h3>
            {loadingPaiements ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-spark-orange animate-spin" /></div>
            ) : paiements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm">Aucun paiement enregistré. Clique "Encaisser" sur un chantier !</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paiements.map((p) => (
                  <div key={p.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{p.chantier_titre}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(p.date_paiement).toLocaleDateString("fr-FR")} — {p.moyen || "Non précisé"}{p.note ? ` — ${p.note}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`font-orbitron font-bold ${p.devise === "USD" ? "text-green-400" : "text-cyan-electric"}`}>
                        {p.montant.toLocaleString("fr-FR")} {p.devise}
                      </span>
                      <button onClick={() => deletePaiement(p.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ ONGLET GALERIE ============ */}
        {tab === "galerie" && (
          <>
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h2 className="font-orbitron text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-electric" /> Publier un nouveau projet
              </h2>
              <p className="text-xs text-gray-500 mb-5">Ajoute la photo dans GitHub (public/images), puis référence-la ici.</p>
              <form onSubmit={publishProjet} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Titre du projet *</label>
                  <input type="text" value={newTitre} onChange={(e) => setNewTitre(e.target.value)} placeholder="Ex : Portail métallique duplex"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Lieu</label>
                  <input type="text" value={newLieu} onChange={(e) => setNewLieu(e.target.value)} placeholder="Ex : Kolwezi"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Chemin de l'image *</label>
                  <input type="text" value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="/images/projet-4.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                {publishMsg && (
                  <p className={`text-xs rounded-lg p-3 ${publishMsg.startsWith("✅") ? "text-green-300 bg-green-400/10 border border-green-400/20" : "text-yellow-300 bg-yellow-400/10 border border-yellow-400/20"}`}>{publishMsg}</p>
                )}
                <button type="submit" disabled={publishing}
                  className="bg-cyan-electric text-onyx font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
                  {publishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {publishing ? "Publication..." : "Publier le projet"}
                </button>
              </form>
            </div>

            <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Images className="w-4 h-4 text-spark-orange" /> Projets publiés ({projets.length})
            </h3>
            {loadingProjets ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-spark-orange animate-spin" /></div>
            ) : projets.length === 0 ? (
              <div className="text-center py-12 text-gray-500"><Images className="w-12 h-12 mx-auto mb-4 opacity-40" /><p className="text-sm">Aucun projet.</p></div>
            ) : (
              <div className="space-y-3">
                {projets.map((p, index) => (
                  <div key={p.id} className="glass-card rounded-2xl p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black/40 shrink-0">
                        <img src={p.image_url} alt={p.titre} className="w-full h-full object-cover" />
                      </div>
                      {editingId === p.id ? (
                        <div className="flex-grow space-y-2 min-w-[200px]">
                          <input type="text" value={editTitre} onChange={(e) => setEditTitre(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-electric" />
                          <div className="flex flex-wrap gap-2">
                            <input type="text" value={editLieu} onChange={(e) => setEditLieu(e.target.value)} placeholder="Lieu"
                              className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-electric" />
                            <input type="text" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="/images/..."
                              className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-electric" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} disabled={savingEdit}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 disabled:opacity-50">
                              <Save className="w-3.5 h-3.5" /> {savingEdit ? "..." : "Sauvegarder"}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10">
                              <X className="w-3.5 h-3.5" /> Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-grow min-w-[150px]">
                          <h4 className="font-bold text-white text-sm">{p.titre}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{p.lieu || "Lieu non précisé"}</p>
                          <p className="text-[10px] text-gray-600 mt-1">{p.image_url}</p>
                        </div>
                      )}
                      {editingId !== p.id && (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button onClick={() => moveProjet(p.id, "up")} disabled={index === 0}
                            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-cyan-electric disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                          <button onClick={() => moveProjet(p.id, "down")} disabled={index === projets.length - 1}
                            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-cyan-electric disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                        </div>
                      )}
                      {editingId !== p.id && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEdit(p)} className="p-2 rounded-lg bg-spark-orange/10 text-spark-orange hover:bg-spark-orange/20"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteProjet(p.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ ONGLET BLOG ============ */}
        {tab === "blog" && (
          <>
            <div className="glass-card rounded-2xl p-6 mb-8">
              <h2 className="font-orbitron text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-electric" /> Écrire un nouvel article
              </h2>
              <p className="text-xs text-gray-500 mb-5">Sépare les paragraphes par une ligne vide.</p>
              <form onSubmit={publishArticle} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Titre *</label>
                  <input type="text" value={newArticleTitre} onChange={(e) => setNewArticleTitre(e.target.value)}
                    placeholder="Titre de l'article"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Extrait</label>
                  <input type="text" value={newArticleExtrait} onChange={(e) => setNewArticleExtrait(e.target.value)}
                    placeholder="Résumé court..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Contenu *</label>
                  <textarea value={newArticleContenu} onChange={(e) => setNewArticleContenu(e.target.value)} rows={12}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none resize-y font-mono" />
                </div>
                {articleMsg && (
                  <p className={`text-xs rounded-lg p-3 ${articleMsg.startsWith("✅") ? "text-green-300 bg-green-400/10 border border-green-400/20" : "text-yellow-300 bg-yellow-400/10 border border-yellow-400/20"}`}>{articleMsg}</p>
                )}
                <button type="submit" disabled={publishingArticle}
                  className="bg-cyan-electric text-onyx font-bold px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm">
                  {publishingArticle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {publishingArticle ? "Publication..." : "Publier l'article"}
                </button>
              </form>
            </div>

            <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-spark-orange" /> Articles publiés ({articles.length})
            </h3>
            {loadingArticles ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-spark-orange animate-spin" /></div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 text-gray-500"><Newspaper className="w-12 h-12 mx-auto mb-4 opacity-40" /><p className="text-sm">Aucun article.</p></div>
            ) : (
              <div className="space-y-3">
                {articles.map((a) => (
                  <div key={a.id} className="glass-card rounded-2xl p-4">
                    {editingArticleId === a.id ? (
                      <div className="space-y-2">
                        <input type="text" value={editArticleTitre} onChange={(e) => setEditArticleTitre(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-electric" />
                        <input type="text" value={editArticleExtrait} onChange={(e) => setEditArticleExtrait(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-electric" />
                        <textarea value={editArticleContenu} onChange={(e) => setEditArticleContenu(e.target.value)} rows={10}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-electric font-mono" />
                        <div className="flex gap-2">
                          <button onClick={saveArticleEdit} disabled={savingArticleEdit}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 disabled:opacity-50">
                            <Save className="w-3.5 h-3.5" /> {savingArticleEdit ? "..." : "Sauvegarder"}
                          </button>
                          <button onClick={() => setEditingArticleId(null)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-bold hover:bg-white/10">
                            <X className="w-3.5 h-3.5" /> Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-white text-sm">{a.titre}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{a.extrait || "Pas d'extrait"}</p>
                          <p className="text-[10px] text-gray-600 mt-1">/blog/{a.slug} — {new Date(a.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEditArticle(a)} className="p-2 rounded-lg bg-spark-orange/10 text-spark-orange hover:bg-spark-orange/20"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteArticle(a.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ============ MODALE CRÉATION CHANTIER ============ */}
      <AnimatePresence>
        {createModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setCreateModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-orbitron text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-electric" /> Nouveau chantier
                </h3>
                <button onClick={() => setCreateModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {createModal.demande && (
                <div className="mb-4 p-3 rounded-lg bg-cyan-electric/5 border border-cyan-electric/20 text-xs text-cyan-electric">
                  ⚡ Pré-rempli depuis la demande gagnée de {createModal.demande.name}
                </div>
              )}

              <form onSubmit={createChantier} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Titre *</label>
                  <input type="text" value={chTitre} onChange={(e) => setChTitre(e.target.value)} required
                    placeholder="Ex : Installation électrique dépôt Kolwezi"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Client</label>
                  <select value={chClientId} onChange={(e) => setChClientId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-electric">
                    <option value="">— Sans client lié —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-onyx">{c.name}{c.company ? ` — ${c.company}` : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Description</label>
                  <textarea value={chDescription} onChange={(e) => setChDescription(e.target.value)} rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-electric resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Devise</label>
                    <select value={chDevise} onChange={(e) => setChDevise(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-electric">
                      <option value="USD" className="bg-onyx">USD ($)</option>
                      <option value="CDF" className="bg-onyx">CDF (FC)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Budget estimé ({chDevise})</label>
                    <input type="number" value={chBudgetEstime} onChange={(e) => setChBudgetEstime(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-cyan-electric focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Assigné à</label>
                    <input type="text" value={chAssigneeA} onChange={(e) => setChAssigneeA(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-electric" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Échéance</label>
                    <input type="date" value={chDateFin} onChange={(e) => setChDateFin(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-electric" />
                  </div>
                </div>
                {chantierMsg && <p className="text-xs text-yellow-300 bg-yellow-400/10 rounded-lg p-3">{chantierMsg}</p>}
                <button type="submit" disabled={creatingChantier}
                  className="w-full bg-cyan-electric text-onyx font-bold py-3.5 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {creatingChantier ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                  {creatingChantier ? "Création..." : "Créer le chantier"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MODALE PAIEMENT ============ */}
      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setPayModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-orbitron text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-400" /> Encaisser un paiement
                </h3>
                <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-400 mb-5">Chantier : <span className="text-white font-bold">{payModal.titre}</span></p>
              <form onSubmit={addPaiement} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Montant *</label>
                    <input type="number" value={payMontant} onChange={(e) => setPayMontant(e.target.value)} required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Devise</label>
                    <select value={payDevise} onChange={(e) => setPayDevise(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-400">
                      <option value="USD" className="bg-onyx">USD ($)</option>
                      <option value="CDF" className="bg-onyx">CDF (FC)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Moyen</label>
                  <select value={payMoyen} onChange={(e) => setPayMoyen(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-green-400">
                    <option value="cash" className="bg-onyx">💵 Cash</option>
                    <option value="mobile_money" className="bg-onyx">📱 Mobile Money</option>
                    <option value="virement" className="bg-onyx">🏦 Virement bancaire</option>
                    <option value="autre" className="bg-onyx">📋 Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Note</label>
                  <input type="text" value={payNote} onChange={(e) => setPayNote(e.target.value)}
                    placeholder="Ex : Acompte 50%, 1ère tranche..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400" />
                </div>
                {payMsg && <p className="text-xs text-yellow-300 bg-yellow-400/10 rounded-lg p-3">{payMsg}</p>}
                <button type="submit" disabled={savingPay}
                  className="w-full bg-green-500 text-white font-bold py-3.5 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                  {savingPay ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  {savingPay ? "Enregistrement..." : "Enregistrer le paiement"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
