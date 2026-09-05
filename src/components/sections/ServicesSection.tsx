"use client";

import { motion } from "framer-motion";
import { Flame, Zap, Building2, Wrench, Paintbrush, DraftingCompass } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      icon: Flame,
      title: "Soudure & Ferronnerie",
      description: "Assemblage de précision, soudure , et création de structures métalliques sur mesure pour environnements extrêmes.",
      color: "orange",
    },
    {
      icon: Zap,
      title: "Installation Electrique",
      description: "Installation, câblage, maintenance et systèmes automatisés pour sites.",
      color: "cyan",
    },
    {
      icon: Building2,
      title: "Construction & Génie Civil",
      description: "Gestion complète de chantier, fondations, structures et finitions de bâtiments industriels et commerciaux.",
      color: "orange",
    },
    {
      icon: Wrench,
      title: "Maintenance Industrielle",
      description: "Entretien préventif et curatif de vos équipements lourds pour maximiser la durée de vie et réduire les temps d'arrêt.",
      color: "cyan",
    },
    {
      icon: Paintbrush,
      title: "Peinture & Traitement",
      description: "Peinture industrielle, sablage et traitement anticorrosion pour protéger vos actifs dans les conditions les plus rudes.",
      color: "orange",
    },
    {
      icon: DraftingCompass,
      title: "Ingénierie & Conseil",
      description: "Études techniques, conception de plans et supervision de projets pour garantir le respect des normes internationales.",
      color: "cyan",
    },
  ];

  return (
    <section id="services" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
       
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          className="text-center mb-16"
        >
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-white mb-4">
            Nos <span className="text-cyan-electric">Expertises</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Une gamme de services techniques pensée pour répondre aux exigences les plus élevées dans chaques secteurs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                  service.color === 'orange'
                    ? 'bg-spark-orange/10 group-hover:bg-spark-orange/30'
                    : 'bg-cyan-electric/10 group-hover:bg-cyan-electric/30'
                }`}>
                  <IconComponent className={`w-7 h-7 ${service.color === 'orange' ? 'text-spark-orange' : 'text-cyan-electric'}`} />
                </div>
               
                <h3 className="font-orbitron text-xl font-bold text-white mb-3">
                  {service.title}
                </h3>
               
                <p className="text-gray-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}