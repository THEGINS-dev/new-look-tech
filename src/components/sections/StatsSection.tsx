"use client"; // Magie ! Ce composant tourne maintenant dans le navigateur

import { useState, useEffect, useRef } from "react";

// Les données de nos statistiques
const statsData = [
  { value: 100, suffix: "%", label: "Sécurité", color: "text-spark-orange" },
  { value: 2, suffix: "", label: "Co-Fondateurs Experts", color: "text-white" },
  { value: 3, suffix: "", label: "Pôles Opérationnels", color: "text-cyan-electric" },
  { value: 360, suffix: "°", label: "Vision Stratégique", color: "text-white" },
];

export default function StatsSection() {
  // States pour gérer l'animation
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(statsData.map(() => 0)); // Initialise les compteurs à 0
  const sectionRef = useRef<HTMLDivElement>(null);

  // Détection du scroll (Est-ce que la section est à l'écran ?)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // Si oui, on lance l'animation !
          observer.unobserve(entry.target); // On arrête d'observer une fois lancé
        }
      },
      { threshold: 0.3 } // Déclenche quand 30% de la section est visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Logique de l'animation des chiffres
  useEffect(() => {
    if (!isVisible) return; // Si pas visible, on ne fait rien

    const intervals = statsData.map((stat, index) => {
      const duration = 2000; // L'animation dure 2 secondes
      const step = stat.value / (duration / 16); // Calcul du pas d'incrémentation (60fps)

      return setInterval(() => {
        setCounts((prevCounts) => {
          const newCounts = [...prevCounts];
          // Si on n'a pas encore atteint la valeur cible, on ajoute le pas
          if (newCounts[index] < stat.value) {
            newCounts[index] = Math.min(newCounts[index] + step, stat.value);
          }
          return newCounts;
        });
      }, 16);
    });

    // Nettoyage des intervalles quand le composant est démonté
    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-16 border-y border-white/10 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
       
        {statsData.map((stat, index) => (
          <div key={index}>
            {/* Le chiffre animé */}
            <div className={`font-orbitron text-4xl md:text-5xl font-bold ${stat.color}`}>
              {Math.floor(counts[index])}
              <span>{stat.suffix}</span>
            </div>
            {/* Le texte descriptif */}
            <div className="text-gray-400 mt-2 text-sm uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}