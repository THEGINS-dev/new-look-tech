"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HardHat } from "lucide-react";

export default function PortfolioSection() {
  const projects = [
    {
      image: "/images/projet-1.jpg",
      title: "Structures Métalliques",
      location: "Megastore, Lubumbashi",
    },
    {
      image: "/images/projet-2.jpg",
      title: "construction",
      location: "Avenue Kafubu, Lubumbashi",
    },
    {
      image: "/images/projet-3.jpg",
      title: "Autre realisation",
      location: "Haut-Katanga, RDC",
    },
  ];

  return (
    <section id="realisations" className="py-20 sm:py-24 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
       
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-14"
        >
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Nos <span className="text-spark-orange">Réalisations</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            La qualité de notre travail parle d'elle-même. Découvrez nos derniers chantiers.
          </p>
        </motion.div>

        {/* ===== VIDÉO DE CHANTIER (responsive) ===== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false, amount: 0.2 }}
          className="relative rounded-2xl overflow-hidden border border-white/10 mb-12"
        >
          <video
            src="/videos/chantier.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-[220px] sm:h-[350px] lg:h-[500px] object-cover"
          />
         
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spark-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-spark-orange"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">En direct du chantier</span>
            </div>
            <h4 className="font-orbitron text-white font-bold text-lg sm:text-xl">NEW LOOK TECH en action</h4>
            <p className="text-gray-400 text-xs sm:text-sm">Nos équipes au travail, Lubumbashi, RDC</p>
          </div>
        </motion.div>

        {/* ===== GRILLE DE PHOTOS ===== */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
         
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
              className="group relative rounded-2xl overflow-hidden h-64 sm:h-72 lg:h-80 border border-white/10 cursor-pointer"
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <HardHat className="w-4 h-4 text-spark-orange" />
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">Projet réalisé</span>
                </div>
                <h4 className="font-orbitron text-white font-bold text-base sm:text-lg">{project.title}</h4>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{project.location}</p>
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}