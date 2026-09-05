// NLTS Assistant - complete Chatbot.tsx
// This file contains the UI, animations, friendly conversation engine,
// company/services/mining/commercial knowledge, context memory and conversions.

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot, Calculator, ChevronDown, CircleHelp, Factory, HardHat,
  MessageCircle, Minus, RotateCcw, Send, Settings2, Sparkles,
  Wrench, X,
} from "lucide-react";

type Sender = "bot" | "user";
type Intent =
  | "company" | "services" | "mining" | "commercial" | "conversion"
  | "contact" | "greeting" | "wellbeing" | "thanks" | "unknown";

type Message = {
  id: number;
  text: string;
  sender: Sender;
  time: string;
};

type Context = {
  lastIntent: Intent | null;
  lastTopic: string | null;
};

const COMPANY_KNOWLEDGE = {
  description:
    "NEW LOOK TECH SERVICE est une entreprise technique au point moderner et specialisé avec un rendu à vos attentes .",
  vision:
    "Notre ambition est de devenir une référence technique en Rdc en proposant des solutions fiables, professionnelles et adaptées aux réalités technique et industrielles.",
  mission:
    "Fournir des services techniques de qualité dans les domaines dans la construction, soudure, peinture industriels, installation électrique etc. ",
  location:
    "Notre pôle opérationnel est situé à Lubumbashi, en République Démocratique du Congo, avec des interventions possibles dans différentes zones meme minières.",
};

const SERVICES = [
  {
    keywords: ["soudure", "souder", "soudage", "tig", "mig", "smaw", "ferronnerie", "métal", "metallique", "métallique"],
    response:
      "Notre pôle Soudure & Ferronnerie couvre plusieurs types des travaux,ainsi que la fabrication et l'assemblage de structures métalliques sur mesure.",
  },
  {
    keywords: ["électricité", "electricite", "électrique", "electrique", "haute tension", "basse tension", "ht", "bt", "câblage", "cablage", "automatisation", "automation"],
    response:
      "Nous intervenons dans l'électricité , notamment sur les installations, le câblage, la maintenance et certaines solutions d'automatisation.",
  },
  {
    keywords: ["construction", "bâtiment", "batiment", "génie civil", "genie civil", "fondation", "chantier", "structure"],
    response:
      "Notre activité construction couvre les travaux de génie civil, les structures, les fondations et différents travaux industriels selon les besoins du projet.",
  },
  {
    keywords: ["maintenance", "réparation", "reparation", "entretien", "préventive", "preventive", "curative", "machine", "équipement", "equipement"],
    response:
      "Nous pouvons intervenir sur des besoins de maintenance préventive et curative des équipements et installations .",
  },
];

const MINING_KEYWORDS = [
  "mine", "mines", "minier", "minière", "miniere", "mining", "usine",
  "site minier", "industrie minière", "industrie miniere", "cuivre",
  "cobalt", "équipement lourd", "equipement lourd",
];

const COMMERCIAL_KEYWORDS = [
  "devis", "prix", "tarif", "coût", "cout", "combien", "budget",
  "offre", "proposition", "commande",
];

const CONTACT_KEYWORDS = [
  "contact", "contacter", "téléphone", "telephone", "whatsapp",
  "email", "mail", "adresse", "localisation", "où", "ou",
];

const GREETING_KEYWORDS = [
  "bonjour", "bonsoir", "salut", "hello", "hey", "coucou", "yo",
];

const WELLBEING_KEYWORDS = [
  "comment vas-tu", "comment vas tu", "comment allez-vous",
  "comment allez vous", "comment tu vas", "tu vas bien",
  "vous allez bien", "ça va", "ca va", "vas-tu bien", "vas tu bien",
];

const UNIT_ALIASES: Record<string, string> = {
  mm: "mm", millimètre: "mm", millimetre: "mm",
  cm: "cm", centimètre: "cm", centimetre: "cm",
  m: "m", mètre: "m", metre: "m",
  km: "km", kilomètre: "km", kilometre: "km",
  mg: "mg", milligramme: "mg",
  g: "g", gramme: "g",
  kg: "kg", kilogramme: "kg",
  t: "t", tonne: "t", tonnes: "t",
  lb: "lb", lbs: "lb", livre: "lb", livres: "lb",
  ml: "ml", millilitre: "ml",
  l: "l", litre: "l",
  bar: "bar", mpa: "mpa", psi: "psi",
};

const CONVERSIONS: Record<string, Record<string, number>> = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000 },
  mass: { mg: 0.000001, g: 0.001, kg: 1, t: 1000, lb: 0.45359237 },
  volume: { ml: 0.001, l: 1 },
  pressure: { bar: 1, mpa: 10, psi: 0.0689475729 },
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) =>
    text.includes(normalizeText(keyword))
  );
}

function getTime() {
  return new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeUnit(unit: string) {
  const raw = unit.toLowerCase().trim();
  return UNIT_ALIASES[raw] ?? UNIT_ALIASES[normalizeText(raw)];
}

function convertUnits(text: string): string | null {
  const match = text.match(
    /(-?\d+(?:[.,]\d+)?)\s*([a-zA-Z°]+)\s+(?:en|vers|to|in|versus)\s+([a-zA-Z°]+)/i
  );
  if (!match) return null;

  const value = parseFloat(match[1].replace(",", "."));
  const from = normalizeUnit(match[2]);
  const to = normalizeUnit(match[3]);
  if (!from || !to) return null;

  const category = Object.keys(CONVERSIONS).find((key) =>
    CONVERSIONS[key][from] !== undefined &&
    CONVERSIONS[key][to] !== undefined
  );
  if (!category) return null;

  const result =
    (value * CONVERSIONS[category][from]) /
    CONVERSIONS[category][to];

  return `🔢 Conversion : ${value} ${from} = ${Number(result.toFixed(6))} ${to}`;
}

function detectIntent(input: string, context: Context): Intent {
  const msg = normalizeText(input);

  if (includesAny(msg, WELLBEING_KEYWORDS)) return "wellbeing";
  if (includesAny(msg, GREETING_KEYWORDS)) return "greeting";
  if (includesAny(msg, ["merci", "thanks", "thank you", "au revoir", "bye", "a bientot", "c est bon"])) return "thanks";
  if (convertUnits(input)) return "conversion";
  if (includesAny(msg, CONTACT_KEYWORDS)) return "contact";
  if (includesAny(msg, COMMERCIAL_KEYWORDS)) return "commercial";
  if (includesAny(msg, MINING_KEYWORDS)) return "mining";
  if (includesAny(msg, ["service", "services", "vous faites quoi", "activité", "activites", "expertise", "savoir faire"])) return "services";
  if (includesAny(msg, ["qui etes vous", "entreprise", "societe", "fondateur", "fondateurs", "equipe", "gins", "heritier", "vision", "mission"])) return "company";

  if (
    context.lastIntent === "services" &&
    includesAny(msg, ["et", "aussi", "encore", "autre", "plus"])
  ) return "services";

  return "unknown";
}

function generateResponse(input: string, context: Context) {
  const normalized = normalizeText(input);
  const conversion = convertUnits(input);

  if (conversion) {
    return { text: conversion, intent: "conversion" as Intent, topic: "conversion" };
  }

  const intent = detectIntent(input, context);

  switch (intent) {
    case "wellbeing":
      return {
        text: "Bonjour ! 👋 Je vais très bien, merci ! Je suis prêt à vous aider. Et vous, comment allez-vous aujourd'hui ? 😊",
        intent, topic: "convivialite",
      };

    case "greeting":
      return {
        text: "Bonjour ! 👋 Ravi de vous accueillir chez NEW LOOK TECH SERVICE. J'espère que vous allez bien. Comment puis-je vous aider aujourd'hui ?",
        intent, topic: "accueil",
      };

    case "thanks":
      return {
        text: "Avec plaisir 🤝. NEW LOOK TECH SERVICE reste à votre disposition pour vos projets techniques etc. À très bientôt !",
        intent, topic: "fin",
      };

    case "company":
      return {
        text: `${COMPANY_KNOWLEDGE.description}\n\n${COMPANY_KNOWLEDGE.vision}\n\n${COMPANY_KNOWLEDGE.mission}`,
        intent, topic: "entreprise",
      };

    case "services": {
      const matched = SERVICES.find((service) =>
        service.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
      );
      return {
        text: matched?.response ??
          "Nos principaux domaines comprennent la soudure et la fabrication métallique, l'électricité , la construction, la maintenance. 🔧⚡🏗️",
        intent, topic: "services",
      };
    }

    case "mining":
      return {
        text: "NEW LOOK TECH SERVICE peut accompagner les besoins techniques des environnements et industriels, notamment en maintenance, fabrication métallique, électricité , construction et interventions sur site.",
        intent, topic: "mining",
      };

    case "commercial":
      return {
        text: "Chaque projet étant différent, nous préférons établir un devis adapté au besoin réel. Décrivez votre projet, les quantités, le lieu d'intervention et les délais souhaités afin que notre équipe puisse vous orienter. hesitez pas à nous contactés viq notre formulaire qui se trouve en bas ou cliquez sur la rubrique |CONTACT|",
        intent, topic: "devis",
      };

    case "contact":
      return {
        text: `${COMPANY_KNOWLEDGE.location}\n\nPour une demande commerciale ou technique, décrivez simplement votre besoin et nous vous orienterons vers le bon interlocuteur cliquez sur la rubrique |CONTACT|.`,
        intent, topic: "contact",
      };

    default:
      return {
        text: "Je veux m'assurer de bien vous orienter. 🤝 Votre demande concerne-t-elle plutôt nos services techniques, le secteur minier, un devis, des informations sur NEW LOOK TECH SERVICE, ou une conversion ?",
        intent: "unknown" as Intent, topic: "orientation",
      };
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");

  const [context, setContext] = useState<Context>({
    lastIntent: null,
    lastTopic: null,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! 👋\nJe suis NLTS Assistant, l'assistant de NEW LOOK TECH SERVICE.\n\nComment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      time: getTime(),
    },
  ]);

  const quickReplies = useMemo(() => [
    { label: "Nos services", icon: <Wrench size={14} />, text: "Quels sont vos services ?" },
    { label: "Secteur minier", icon: <HardHat size={14} />, text: "Que faites-vous dans le secteur minier ?" },
    { label: "Demander un devis", icon: <Factory size={14} />, text: "Je souhaite demander un devis" },
    { label: "Conversions", icon: <Calculator size={14} />, text: "Je veux faire une conversion" },
  ], []);

  function handleSend(forcedText?: string) {
    const text = forcedText ?? inputText;
    if (!text.trim() || isTyping) return;

    setMessages((prev) => [...prev, {
      id: Date.now(),
      text,
      sender: "user",
      time: getTime(),
    }]);

    setInputText("");
    setIsTyping(true);

    const response = generateResponse(text, context);

    setContext({
      lastIntent: response.intent,
      lastTopic: response.topic,
    });

    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: response.text,
        sender: "bot",
        time: getTime(),
      }]);
      setIsTyping(false);
    }, 650 + Math.random() * 650);
  }

  function resetConversation() {
    setMessages([{
      id: Date.now(),
      text: "Bonjour ! 👋\nJe suis NLTS Assistant. Comment puis-je vous aider ?",
      sender: "bot",
      time: getTime(),
    }]);
    setContext({ lastIntent: null, lastTopic: null });
    setInputText("");
    setIsTyping(false);
  }

  return (
    <>
      <motion.button
        aria-label="Ouvrir NLTS Assistant"
        onClick={() => setIsOpen((v) => !v)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 text-white shadow-[0_15px_45px_rgba(249,115,22,0.40)] border border-white/20"
      >
        <motion.div
          animate={{ y: [0, -4, 0, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {isOpen ? <X size={27} /> : <Bot size={28} />}
        </motion.div>

        {!isOpen && (
          <motion.span
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-orange-400"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 25 }}
            className="fixed bottom-[96px] right-5 z-[99] w-[min(410px,calc(100vw-24px))] h-[min(650px,calc(100vh-120px))] overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#080b10]/95 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.65)] flex flex-col"
          >
            <div className="absolute -top-32 -right-20 w-72 h-72 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />
            <div className="absolute top-40 -left-32 w-64 h-64 rounded-full bg-cyan-400/5 blur-[80px] pointer-events-none" />

            <div className="relative shrink-0 px-5 py-4 border-b border-white/[0.08] bg-white/[0.025]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/20 to-cyan-400/10 border border-orange-400/20 flex items-center justify-center"
                  >
                    <Bot size={22} className="text-orange-400" />
                    <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080b10]" />
                  </motion.div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold tracking-tight">NLTS Assistant</h3>
                      <Sparkles size={13} className="text-orange-400" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isTyping ? "Réflexion..." : "Assistant en ligne"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button aria-label="Réduire" onClick={() => setIsMinimized((v) => !v)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition">
                    {isMinimized ? <ChevronDown size={18} /> : <Minus size={18} />}
                  </button>
                  <button aria-label="Réinitialiser" onClick={resetConversation} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition">
                    <RotateCcw size={16} />
                  </button>
                  <button aria-label="Fermer" onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 flex items-center gap-2 text-[10px] text-white/35">
                  <Settings2 size={11} />
                  <span>Entreprise • Services • Mining • Devis • Conversions</span>
                </motion.div>
              )}
            </div>

            {isMinimized ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-4 flex items-center gap-3 text-white/40 text-xs">
                <MessageCircle size={15} className="text-orange-400" />
                Conversation réduite. Cliquez sur la flèche pour continuer.
              </motion.div>
            ) : (
              <>
                <div className="relative flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.12)_transparent]">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[86%] flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-3 rounded-2xl text-[13px] leading-[1.55] whitespace-pre-line ${
                          message.sender === "user"
                            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-orange-500/10"
                            : "bg-white/[0.055] border border-white/[0.06] text-white/80 rounded-bl-md"
                        }`}>
                          {message.text}
                        </div>
                        <span className="mt-1.5 px-1 text-[9px] text-white/20">{message.time}</span>
                      </div>
                    </motion.div>
                  ))}

                  <AnimatePresence>
                    {isTyping && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex">
                        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.055] border border-white/[0.06] flex gap-1">
                          {[0, 1, 2].map((dot) => (
                            <motion.span
                              key={dot}
                              animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.12 }}
                              className="w-1.5 h-1.5 rounded-full bg-orange-400"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="shrink-0 px-4 pb-3 overflow-x-auto [scrollbar-width:none]">
                  <div className="flex gap-2 min-w-max">
                    {quickReplies.map((reply) => (
                      <motion.button
                        key={reply.label}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSend(reply.text)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.08] text-white/60 hover:text-white text-[10px] transition"
                      >
                        {reply.icon}
                        {reply.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 p-4 pt-2 border-t border-white/[0.07] bg-white/[0.02]">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.09] bg-black/20 p-1.5 focus-within:border-orange-400/30 transition">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Écrivez votre demande..."
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13px] text-white placeholder:text-white/25 outline-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleSend()}
                      disabled={!inputText.trim() || isTyping}
                      aria-label="Envoyer"
                      className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white disabled:opacity-20 transition"
                    >
                      <Send size={15} />
                    </motion.button>
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-white/20">
                    <CircleHelp size={10} />
                    <span>NLTS Assistant • Informations indicatives</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
