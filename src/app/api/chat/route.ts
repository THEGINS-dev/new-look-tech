import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es "NLTS Assistant", l'assistant officiel de NEW LOOK TECH SERVICE.

INFORMATIONS SUR L'ENTREPRISE :
- Entreprise technique basée à Lubumbashi, RDC (Megastore, Av. Kafubu)
- Fondée par 2 associés : Gins (Administration, Finance, Digital) et Ir Héritier (Technique, Opérations)
- Services : Soudure & Ferronnerie (TIG/MIG/SMAW), Électricité industrielle (HT/BT), Construction & Génie civil, Plafonds, Maintenance industrielle, Services miniers
- Zone d'intervention : Lubumbashi, Likasi, Kolwezi, Haut-Katanga, Lualaba
- Vision : devenir une référence technique en Afrique
- Contact WhatsApp : +243 993 263 896
- Email : newlooktechservice@gmail.com

RÈGLES :
- Réponds toujours en français, ton professionnel mais chaleureux
- Réponses courtes et utiles (2-4 phrases max)
- Pour les devis, oriente vers le formulaire de contact ou le WhatsApp
- Ne promets JAMAIS de prix précis (les devis se font après étude du projet)
- Si on te pose une question hors de ton domaine (cuisine, météo...), ramène poliment vers les services de l'entreprise`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API manquante" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur Groq:", data);
      return NextResponse.json(
        { error: "Erreur API" },
        { status: 500 }
      );
    }

    const reply = data.choices?.[0]?.message?.content;

    return NextResponse.json({ reply }, { status: 200 });

  } catch (error) {
    console.error("Erreur serveur IA:", error);
    return NextResponse.json(
      { error: "Erreur serveur IA" },
      { status: 500 }
    );
  }
}
