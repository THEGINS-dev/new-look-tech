"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // On ne trace que le site public (pas le dashboard admin)
    if (pathname?.startsWith("/dashboard")) return;

    // Anti-doublon : ne pas retracer la même page consécutivement
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Anti-double-comptage strict (navigateur recharge) : 1 trace par page par session de 30 sec
    const cacheKey = `nlts_visit_${pathname}`;
    const lastVisit = sessionStorage.getItem(cacheKey);
    const now = Date.now();
    if (lastVisit && now - parseInt(lastVisit, 10) < 30000) return;
    sessionStorage.setItem(cacheKey, String(now));

    fetch("/api/visites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname }),
    }).catch(() => {
      // Silencieux : on ne casse jamais l'expérience visiteur pour un tracking
    });
  }, [pathname]);

  return null; // Ce composant n'affiche rien
}
