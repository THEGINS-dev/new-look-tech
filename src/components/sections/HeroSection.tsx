"use client";

import { motion } from "framer-motion";
import { Flame, Cog } from "lucide-react";

export default function HeroSection() {
  return (
    <section id="accueil" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
     
      {/* Lueurs d'ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-spark-orange rounded-full blur-[200px] opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-electric rounded-full blur-[150px] opacity-10"></div>

      <div className="relative z-10 max-w-5xl">
       
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 inline-block border border-cyan-electric text-cyan-electric px-4 py-1.5 rounded-full text-xs tracking-[0.3em] uppercase font-semibold"
        >
          L'excellence technique au point moderne
        </motion.div>
       
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-orbitron text-4xl sm:text-6xl md:text-8xl font-black leading-tight tracking-tighter text-white mb-6"
        >
          CONSTRUISONS <br />
          <span className="text-spark-orange">L'AVENIR</span> ENSEMBLE
        </motion.h1>
       
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Soudure, Construction, Maintenance etc.<br /> <br className="hidden sm:block" />
          Des solutions techniques de classe mondiale pour different types de secteurs.
        </motion.p>
       
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* Bouton cliquable → formulaire */}
          <a
            href="#contact"
            className="px-8 py-4 bg-spark-orange text-white font-bold rounded-lg hover:bg-orange-500 transition-all duration-300 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            <Flame className="w-5 h-5" /> Démarrer un Projet
          </a>
          {/* Bouton cliquable → services */}
          <a
            href="#services"
            className="px-8 py-4 border border-white/20 text-white font-bold rounded-lg hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Cog className="w-5 h-5" /> Nos Expertises
          </a>
        </motion.div>
      </div>

      {/* Flèche de scroll */}
      <motion.a
        href="#services"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 text-gray-500 hover:text-spark-orange transition-colors"
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          ↓
        </motion.div>
      </motion.a>
    </section>
  );
}