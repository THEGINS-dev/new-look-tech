"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Newspaper, CalendarDays, ArrowRight, Newspaper as NewsIcon } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  titre: string;
  extrait: string | null;
  created_at: string;
};

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          setArticles(Array.isArray(data) ? data : []);
        }
      } catch {
        // silencieux
      }
      setLoading(false);
    }
    loadArticles();
  }, []);

  return (
    <main className="min-h-screen bg-onyx pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-electric/30 bg-cyan-electric/5 px-4 py-2">
            <Newspaper className="h-3.5 w-3.5 text-cyan-electric" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-electric">Le Journal NLTS</span>
          </div>
          <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Blog <span className="text-spark-orange">NLTS</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed">
            Conseils techniques, actualités et expertises : tout le savoir-faire de NEW LOOK TECH SERVICE, partagé avec vous.
          </p>
        </motion.div>

        {/* Liste des articles */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-spark-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <NewsIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">Les premiers articles arrivent bientôt. Restez connectés !</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${article.slug}`}
                  className="glass-card rounded-2xl p-6 block h-full group">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(article.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </div>
                  <h2 className="font-orbitron text-lg font-bold text-white mb-3 group-hover:text-spark-orange transition-colors">
                    {article.titre}
                  </h2>
                  {article.extrait && (
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      {article.extrait}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-cyan-electric group-hover:gap-3 transition-all">
                    Lire l'article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
