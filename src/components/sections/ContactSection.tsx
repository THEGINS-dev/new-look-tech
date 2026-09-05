"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Mail, MapPin, MessageCircle, Sparkles,
  Loader2, X, Building2, Clock3, MessageSquare,
} from "lucide-react";

const services = [
  "Soudure & Ferronnerie",
  "Électricité industrielle",
  "Construction & Génie civil",
  "Maintenance industrielle",
  "Projet minier",
  "Autre demande",
];

const locations = [
  "Lubumbashi",
  "Likasi",
  "Kolwezi",
  "Haut-Katanga",
  "Lualaba",
  "Autre localisation",
];

/* ===== Variante d'animation fluide (courbe douce) ===== */
const EASE = [0.22, 1, 0.36, 1];

/* --- Composants internes --- */

function ContactInfo({ icon, title, text, href, accent, delay }: {
  icon: React.ReactNode; title: string; text: string; href?: string; accent: "orange" | "cyan"; delay: number;
}) {
  const color = accent === "orange" ? "text-spark-orange" : "text-cyan-electric";
  const hoverBorder = accent === "orange" ? "hover:border-spark-orange/60" : "hover:border-cyan-electric/60";

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={`flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 ${href ? `cursor-pointer ${hoverBorder} hover:bg-white/[0.07] hover:shadow-lg` : ""}`}
    >
      <div className={`shrink-0 w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{title}</p>
        <p className="text-sm font-semibold text-gray-50 mt-0.5 break-words leading-snug">{text}</p>
      </div>
    </motion.div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>
  ) : content;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 transition-colors group-focus-within:text-cyan-electric">
      {children}
    </label>
  );
}

function FloatingInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="group relative">
      <FieldLabel htmlFor={props.name || ""}>{props.label}</FieldLabel>
      <input
        id={props.name}
        {...props}
        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-gray-50 outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-cyan-electric/70 focus:bg-cyan-electric/[0.03] focus:ring-1 focus:ring-cyan-electric/25"
      />
    </div>
  );
}

function FloatingSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }) {
  return (
    <div className="group relative">
      <FieldLabel htmlFor={props.name || ""}>{props.label}</FieldLabel>
      <select
        id={props.name}
        {...props}
        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-gray-50 outline-none transition-all duration-300 focus:border-cyan-electric/70 focus:bg-cyan-electric/[0.03] focus:ring-1 focus:ring-cyan-electric/25"
      >
        <option value="" disabled className="text-gray-500">Choisir...</option>
        {props.options.map(opt => <option key={opt} value={opt} className="bg-onyx text-gray-50">{opt}</option>)}
      </select>
    </div>
  );
}

/* --- Composant principal --- */

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "", company: "", email: "", phone: "", service: "", location: "", message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status !== "idle") { setStatus("idle"); setErrorMessage(""); }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSending) return;
    setIsSending(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Une erreur est survenue lors de l'envoi.");
      }
      setStatus("success");
      setFormData({ name: "", company: "", email: "", phone: "", service: "", location: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Impossible d'envoyer votre demande.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-onyx py-20 sm:py-24">
     
      {/* Atmosphère (légère : 2 lueurs + 2 lignes) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-spark-orange/10 blur-[120px]" />
        <motion.div animate={{ x: [0, -35, 0], y: [0, 25, 0], scale: [1, 1.12, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-40 bottom-10 h-[500px] w-[500px] rounded-full bg-cyan-electric/10 blur-[130px]" />
        <div className="absolute -right-[18%] top-[15%] h-[1px] w-[75%] rotate-[-18deg] bg-gradient-to-r from-transparent via-cyan-electric/25 to-transparent" />
        <div className="absolute -right-[10%] top-[28%] h-[1px] w-[60%] rotate-[-18deg] bg-gradient-to-r from-transparent via-spark-orange/15 to-transparent" />
      </div>

      {/* CONTENEUR RÉTRÉCI : max-w-6xl au lieu de 7xl */}
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
       
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.7, ease: EASE }}
          className="mb-12 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-electric/30 bg-cyan-electric/5 px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-electric" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-electric">Parlons de votre projet</span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Lancez votre <span className="text-spark-orange">projet</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base text-gray-400 leading-relaxed">
            Vous avez un projet de construction ou technique ? Notre équipe vous répond avec une approche adaptée.
          </p>
        </motion.div>

        {/* ===== CARTE PRINCIPALE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }} transition={{ duration: 0.9, ease: EASE }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] backdrop-blur-md shadow-2xl shadow-black/50"
        >
          {/* Séparation visuelle gauche/droite : ligne verticale lumineuse */}
          <div className="hidden lg:block absolute left-[42%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-spark-orange/40 to-transparent pointer-events-none" />

          <div className="grid lg:grid-cols-[42%_58%]">
           
            {/* ================= PANNEAU GAUCHE (slide depuis la gauche) ================= */}
            <motion.div
              initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.9, ease: EASE }}
              className="relative overflow-hidden p-7 sm:p-9 lg:p-10 bg-gradient-to-br from-white/[0.04] via-transparent to-spark-orange/[0.05] border-b lg:border-b-0 border-white/10"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }} transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
                className="mb-7 flex items-center gap-3"
              >
                <Image src="/images/logo.jpg" alt="Logo NEW LOOK TECH" width={46} height={46} className="rounded-xl object-cover" />
                <div>
                  <p className="font-orbitron text-sm font-black tracking-wide text-white">NEW LOOK <span className="text-spark-orange">TECH</span></p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-gray-500">Technical Services</p>
                </div>
              </motion.div>

              <h3 className="font-orbitron text-xl sm:text-2xl font-bold uppercase leading-tight text-white mb-3">
                Une idée.<br /><span className="text-cyan-electric">Un besoin.</span><br />Une solution.
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs">
                Contactez-nous directement, notre équipe vous répond dès que possible.
              </p>

              <div className="space-y-3">
                <ContactInfo
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="WhatsApp Direct"
                  text="+243 993 263 896"
                  href="https://wa.me/243993263896?text=Bonjour%20NEW%20LOOK%20TECH%2C%20je%20souhaite%20un%20devis."
                  accent="cyan"
                  delay={0.2}
                />
                <ContactInfo
                  icon={<Mail className="h-5 w-5" />}
                  title="Email Professionnel"
                  text="newlooktechservice@gmail.com"
                  href="mailto:newlooktechservice@gmail.com?subject=Demande%20de%20devis"
                  accent="orange"
                  delay={0.3}
                />
                <ContactInfo
                  icon={<MapPin className="h-5 w-5" />}
                  title="Zone d'intervention"
                  text="Megastore, Av. Kafubu, Lubumbashi"
                  href="https://www.google.com/maps/search/?api=1&query=Megastore+Lubumbashi+RDC"
                  accent="cyan"
                  delay={0.4}
                />
                <ContactInfo
                  icon={<Clock3 className="h-5 w-5" />}
                  title="Disponibilité"
                  text="Lun - Sam : 8h00 - 18h00"
                  accent="orange"
                  delay={0.5}
                />
              </div>
            </motion.div>

            {/* ================= PANNEAU DROIT : FORMULAIRE (slide depuis la droite) ================= */}
            <motion.div
              initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              className="relative p-7 sm:p-9 lg:p-10"
            >
              <div className="mb-7 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-electric" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">Demande de contact</span>
              </div>

              {/* FORMULAIRE RÉTRÉCI : max-w-lg = largeur confortable, jamais trop large */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto lg:mx-0">
               
                {/* Champ Nom en pleine largeur pour respirer */}
                <FloatingInput label="Nom complet *" name="name" value={formData.name} onChange={handleChange} placeholder="Votre nom" required />
               
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingInput label="Entreprise" name="company" value={formData.company} onChange={handleChange} placeholder="Votre entreprise" />
                  <FloatingInput label="Téléphone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+243 ..." />
                </div>

                <FloatingInput label="Adresse email *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="vous@exemple.com" required />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingSelect label="Service recherché *" name="service" value={formData.service} onChange={handleChange} options={services} required />
                  <FloatingSelect label="Localisation" name="location" value={formData.location} onChange={handleChange} options={locations} />
                </div>

                <div className="group relative">
                  <FieldLabel htmlFor="message">Décrivez votre projet *</FieldLabel>
                  <textarea
                    id="message" name="message" rows={4} required
                    value={formData.message} onChange={handleChange}
                    placeholder="Décrivez brièvement votre besoin..."
                    className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-sm text-gray-50 outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-cyan-electric/70 focus:bg-cyan-electric/[0.03] focus:ring-1 focus:ring-cyan-electric/25"
                  />
                </div>

                {/* Statuts */}
                <AnimatePresence mode="wait">
                  {status === "success" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ ease: EASE }}>
                      <div className="flex items-start gap-3 rounded-xl border border-green-400/25 bg-green-400/10 p-4">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-400/15">
                          <Check className="h-3.5 w-3.5 text-green-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-200">Demande envoyée avec succès.</p>
                          <p className="mt-1 text-xs text-gray-400">Merci ! Notre équipe reviendra vers vous prochainement.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {status === "error" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ ease: EASE }}>
                      <div className="flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 p-4">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/15">
                          <X className="h-3.5 w-3.5 text-red-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-200">Impossible d'envoyer la demande.</p>
                          <p className="mt-1 text-xs text-gray-400">{errorMessage}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton */}
                <motion.button
                  type="submit" disabled={isSending}
                  whileHover={!isSending ? { scale: 1.01 } : {}} whileTap={!isSending ? { scale: 0.98 } : {}}
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-spark-orange px-6 py-4 text-sm font-bold text-white shadow-lg shadow-spark-orange/25 transition-all duration-300 hover:shadow-spark-orange/40 disabled:opacity-70"
                >
                  <motion.span initial={{ x: "-120%" }} whileHover={{ x: "120%" }} transition={{ duration: 0.7 }} className="absolute inset-y-0 w-1/3 -skew-x-12 bg-white/25" />
                  <span className="relative z-10">{isSending ? "Envoi en cours..." : "Envoyer ma demande"}</span>
                  <span className="relative z-10">
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
                  </span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}