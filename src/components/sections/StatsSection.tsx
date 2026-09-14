"use client";

import { useState, useEffect, useRef } from "react";

const statsData = [
  { value: 100, suffix: "%", label: "Sécurité", color: "text-spark-orange" },
  { value: 6, suffix: "+", label: "Services d'expertise", color: "text-white" },
  { value: 24, suffix: "/7", label: "Disponibilité", color: "text-cyan-electric" },
  { value: 360, suffix: "°", label: "Vision Stratégique", color: "text-white" },
];

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(statsData.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setCounts(statsData.map(() => 0));
      return;
    }
    const intervals = statsData.map((stat, index) => {
      const step = stat.value / (2000 / 16);
      return setInterval(() => {
        setCounts((prev) => {
          const newCounts = [...prev];
          if (newCounts[index] < stat.value) {
            newCounts[index] = Math.min(newCounts[index] + step, stat.value);
          }
          return newCounts;
        });
      }, 16);
    });
    return () => intervals.forEach((i) => clearInterval(i));
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-16 border-y border-white/10 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {statsData.map((stat, index) => (
          <div key={index}>
            <div className={`font-orbitron text-4xl font-bold ${stat.color}`}>
              {Math.floor(counts[index])}
              <span>{stat.suffix}</span>
            </div>
            <div className="text-gray-400 mt-2 text-sm uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
