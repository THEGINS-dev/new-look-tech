"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, ArrowLeft, Newspaper } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  titre: string;
  extrait: string | null;
  contenu: string;
  created_at: string;
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          const found = (Array.isArray(data) ? data : []).find(
            (a: Article) => a.slug === slug
          );
          if (found) {
            setArticle(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-onyx pt-28 pb-24 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-spark-orange border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="min-h-screen bg-onyx pt-28 pb-24 px-6 flex flex-col items-center justify-center text-center">
        <Newspaper className="w-12 h-12 text-gray-600 mb-4" />
        <h1 className="font-orbitron text-2xl font-bold text-white mb-2">Article introuvable</h1>
        <p className="text-gray-500 text-sm mb-6">Cet article n'existe pas ou a été retiré.</p>
        <Link href="/blog" className="text-cyan-electric text-sm font-bold hover:underline">
          ← Retour au blog
        </Link>
      </main>
    );
  }

  // Le contenu est écrit avec des doubles sauts de ligne = paragraphes
  const paragraphes = article.contenu.split(/\n\n+/);

  return (
    <main className="min-h-screen bg-onyx pt-28 pb-24 px-6">
      <article className="max-w-3xl mx-auto">

        {/* Retour */}
        <button onClick={() => router.push("/blog")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-spark-orange transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </button>

        {/* Header de l'article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date(article.created_at).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </div>
          <h1 className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-6">
            {article.titre}
          </h1>
          {article.extrait && (
            <p className="text-base text-cyan-electric/80 border-l-2 border-spark-orange pl-4 mb-8 leading-relaxed">
              {article.extrait}
            </p>
          )}
        </motion.div>

        {/* Contenu */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-5"
        >
          {paragraphes.map((para, index) => (
            <p key={index} className="text-[15px] sm:text-base text-gray-300 leading-[1.9]">
              {para}
            </p>
          ))}
        </motion.div>

        {/* CTA de fin d'article (conversion !) */}
        <div className="mt-14 glass-card rounded-2xl p-6 text-center">
          <p className="text-white font-bold mb-2">Un projet similaire en tête ?</p>
          <p className="text-gray-400 text-sm mb-5">
            NEW LOOK TECH SERVICE réalise vos projets techniques partout en RDC.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/#contact"
              className="bg-spark-orange text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-500 transition-all text-sm">
              Demander un devis
            </Link>
            <a href="https://wa.me/243972083066?text=Bonjour%20NEW%20LOOK%20TECH%2C%20j%27ai%20lu%20votre%20article%20et%20je%20souhaite%20discuter%20d%27un%20projet."
              target="_blank" rel="noopener noreferrer"
              className="border border-green-500/40 text-green-400 font-bold px-6 py-3 rounded-lg hover:bg-green-500/10 transition-all text-sm">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
