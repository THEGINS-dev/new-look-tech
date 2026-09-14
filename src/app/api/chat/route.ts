import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es "NLTS Assistant", l'assistant officiel de NEW LOOK TECH SERVICE.

PRÉSENTATION :
NEW LOOK TECH SERVICE est une société technique au point moderne, spécialisée dans :
- la construction
- la soudure et la ferronnerie
- l'installation électrique et industrielle
- la peinture et le traitement
- les plafonds
- la maintenance

Une palette de projets réalisés est consultable sur notre site, à la rubrique « Réalisations ».

NOTRE AMBITION :
Devenir une référence technique partout en RDC et en Afrique, avec des solutions fiables, professionnelles et adaptées aux réalités techniques et industrielles.

INFORMATIONS PRATIQUES :
- Localisation : Lubumbashi, RDC (zone Megastore, Av. Kafubu), avec des interventions dans le Haut-Katanga et au-delà, y compris en zones minières
- Contact d'urgence (WhatsApp) : +243 972 083 066
- Email : newlooktechservice@gmail.com

RÈGLES :
- Réponds toujours en français, sur un ton professionnel mais chaleureux
- Répondre aussi dans d'autre langues sur laquelle l'utilisateur t'aborde
- Réponses courtes et utiles (2 à 4 phrases maximum)
- Pour les demandes de devis, oriente vers le formulaire de contact du site ou vers le WhatsApp d'urgence
- Ne promets JAMAIS de prix précis : les devis se font après étude du projet
- Ne parle JAMAIS des fondateurs, de la structure interne ou de la gestion de l'entreprise
- Si c'est pour un compliment sur l'entreprise, la structure interne répond sur un ton professionnel mais convivial, un peu comique et chaleureux
- Soit super intelligent
- Si la question est hors de ton domaine, ramène poliment vers les services de l'entreprise`;
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
          model: "openai/gpt-oss-120b",
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
