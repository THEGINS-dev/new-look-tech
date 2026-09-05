"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0 bg-onyx/70 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
       
        {/* Logo */}
        <h1 className="font-orbitron text-xl font-bold text-white">
          NEW <span className="text-spark-orange">LOOK</span> TECH
        </h1>

        {/* Liens de navigation (Visibles sur PC, cachés sur Mobile) */}
        <div className="hidden md:flex space-x-8 font-inter text-sm font-semibold tracking-wider uppercase">
          <a href="#accueil" className="hover:text-spark-orange transition-colors text-gray-300">Accueil</a>
          <a href="#services" className="hover:text-spark-orange transition-colors text-gray-300">Services</a>
          <a href="#realisations" className="hover:text-spark-orange transition-colors text-gray-300">Réalisations</a>
          <a href="#contact" className="hover:text-spark-orange transition-colors text-gray-300">Contact</a>
        </div>

        {/* Bouton Devis (PC) & Hamburger (Mobile) */}
        <div className="flex items-center gap-4">
          <a
            href="#contact"
            className="hidden sm:block bg-spark-orange px-5 py-2 rounded text-white font-bold text-sm hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20"
          >
            Devis
          </a>
         
          {/* Bouton Hamburger pour Mobile */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Menu Mobile Déroulant (Animation Framer Motion) */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-onyx/95 backdrop-blur-lg border-b border-white/10 px-6 pb-6 space-y-4"
        >
          <a href="#accueil" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-spark-orange transition-colors py-2">Accueil</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-spark-orange transition-colors py-2">Services</a>
          <a href="#realisations" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-spark-orange transition-colors py-2">Réalisations</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-spark-orange transition-colors py-2">Contact</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block bg-spark-orange px-5 py-2 rounded text-white font-bold text-sm text-center mt-4">Demander un Devis</a>
        </motion.div>
      )}
    </nav>
  );
}