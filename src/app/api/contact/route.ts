import { NextResponse } from "next/server";

/* =========================================================
   SÉCURITÉ 1 : LIMITATION DE DÉBIT (ANTI-SPAM)
   Maximum 5 demandes par IP toutes les 10 minutes
========================================================= */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

/* =========================================================
   SÉCURITÉ 2 : NETTOYAGE DES DONNÉES (ANTI-XSS)
   Supprime tout code HTML/JS injecté dans les champs
========================================================= */
function sanitizeText(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")       // Supprime les balises <script>, <img>...
    .replace(/[<>"'`]/g, "")       // Supprime les caractères dangereux restants
    .replace(/javascript:/gi, "")  // Neutralise les liens javascript:
    .replace(/on\w+=/gi, "")       // Neutralise onclick=, onerror=...
    .trim()
    .slice(0, maxLength);          // Limite la longueur
}

/* =========================================================
   SÉCURITÉ 3 : VALIDATION DU FORMAT EMAIL
========================================================= */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function POST(request: Request) {
  try {
    /* ===== ANTISPAM : Rate limiting par IP ===== */
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: "Trop de demandes envoyées. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    /* ===== SÉCURITÉ 4 : REFUS DES REQUÊTES TROP GROSSES (>10 Ko) ===== */
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > 10000) {
      return NextResponse.json(
        { message: "Données trop volumineuses." },
        { status: 413 }
      );
    }

    /* ===== RÉCEPTION ===== */
    const data = await request.json();
    const { name, company, email, phone, service, location, message } = data;

    /* ===== NETTOYAGE DE TOUTES LES DONNÉES ===== */
    const cleanName = sanitizeText(name, 100);
    const cleanCompany = sanitizeText(company, 100);
    const cleanEmail = sanitizeText(email, 150);
    const cleanPhone = sanitizeText(phone, 30);
    const cleanService = sanitizeText(service, 100);
    const cleanLocation = sanitizeText(location, 100);
    const cleanMessage = sanitizeText(message, 2000);

    /* ===== VALIDATION ===== */
    if (!cleanName || !cleanEmail || !cleanMessage) {
      return NextResponse.json(
        { message: "Nom, email et message sont obligatoires" },
        { status: 400 }
      );
    }

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { message: "Adresse email invalide" },
        { status: 400 }
      );
    }

    /* ===== LIEN WHATSAPP DU CLIENT (numéro nettoyé) ===== */
    const waNumber = cleanPhone.replace(/[^0-9]/g, "");
    const waLink = waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour " + cleanName + ", ici NEW LOOK TECH SERVICE au sujet de votre demande de devis.")}`
      : null;

    /* ===== EMAIL HTML (ton design NLTS) ===== */
    const emailHtml = `
    <div style="margin:0;padding:0;background:#0d0d0d;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#111111;">

        <!-- HEADER ORANGE -->
        <div style="background:linear-gradient(135deg,#ff8c00,#ff6b00);padding:36px 24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:30px;letter-spacing:2px;">NEW LOOK TECH</h1>
          <p style="color:#ffe4cc;margin:10px 0 0;font-size:13px;letter-spacing:3px;">EXCELLENCE TECHNIQUE AU POINT MODERNE</p>
        </div>

        <!-- TITRE -->
        <div style="padding:28px 24px 8px;">
          <h2 style="color:#ff6b00;margin:0;font-size:24px;">🔥 Nouveau Devis Reçu</h2>
          <p style="color:#aaaaaa;margin:8px 0 0;font-size:14px;">Vous avez une nouvelle demande via votre site web</p>
        </div>

        <!-- INFOS CLIENT -->
        <div style="padding:16px 24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:10px;color:#888888;width:140px;border-bottom:1px solid #222222;">👤 Nom</td><td style="padding:10px;color:#ffffff;font-weight:bold;border-bottom:1px solid #222222;">${cleanName}</td></tr>
            <tr><td style="padding:10px;color:#888888;border-bottom:1px solid #222222;">🏢 Entreprise</td><td style="padding:10px;color:#ffffff;border-bottom:1px solid #222222;">${cleanCompany || "Non précisé"}</td></tr>
            <tr><td style="padding:10px;color:#888888;border-bottom:1px solid #222222;">📧 Email</td><td style="padding:10px;border-bottom:1px solid #222222;"><a href="mailto:${cleanEmail}" style="color:#00f0ff;">${cleanEmail}</a></td></tr>
            <tr><td style="padding:10px;color:#888888;border-bottom:1px solid #222222;">📞 Téléphone</td><td style="padding:10px;color:#ffffff;border-bottom:1px solid #222222;">${cleanPhone || "Non précisé"}</td></tr>
            <tr><td style="padding:10px;color:#888888;border-bottom:1px solid #222222;">📍 Localisation</td><td style="padding:10px;color:#ffffff;border-bottom:1px solid #222222;">${cleanLocation || "Non précisé"}</td></tr>
          </table>
        </div>

        <!-- BADGE SERVICE -->
        <div style="padding:8px 24px 16px;">
          <span style="display:inline-block;background:#ff6b00;color:#ffffff;padding:8px 18px;border-radius:6px;font-weight:bold;font-size:14px;">🛠️ ${cleanService || "Service non précisé"}</span>
        </div>

        <!-- MESSAGE DU CLIENT -->
        <div style="margin:0 24px 24px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:20px;">
          <p style="color:#888888;margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Message du client</p>
          <p style="color:#ffffff;margin:0;font-size:15px;font-style:italic;line-height:1.7;">"${cleanMessage}"</p>
        </div>

        <!-- BOUTONS D'ACTION -->
        <div style="padding:0 24px 28px;text-align:center;">
          <a href="mailto:${cleanEmail}" style="display:inline-block;background:#ff6b00;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:15px;margin:4px;">✉️ Répondre par Email</a>
          ${waLink ? `<a href="${waLink}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:15px;margin:4px;">💬 WhatsApp</a>` : ""}
        </div>

        <!-- FOOTER -->
        <div style="background:#000000;padding:20px;text-align:center;border-top:1px solid #222222;">
          <p style="color:#888888;margin:0;font-size:12px;">New Look Tech Service - Lubumbashi, Katanga, CD</p>
          <p style="color:#555555;margin:6px 0 0;font-size:11px;">Cet email a été envoyé automatiquement depuis votre site web</p>
        </div>

      </div>
    </div>`;

    /* ===== ENVOI VIA RESEND ===== */
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY manquante");
      return NextResponse.json(
        { message: "Service d'envoi non configuré" },
        { status: 500 }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "NLTS Website <onboarding@resend.dev>",
        to: ["newlooktechservice@gmail.com"],
        reply_to: cleanEmail,
        subject: `🔥 Nouveau devis: ${cleanService || "Demande"} - ${cleanName}${cleanCompany ? ` (${cleanCompany})` : ""}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Erreur Resend:", await resendResponse.json().catch(() => ({})));
      return NextResponse.json(
        { message: "Erreur lors de l'envoi de votre demande" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Erreur formulaire:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
