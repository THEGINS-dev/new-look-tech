import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. On réceptionne les données envoyées par le formulaire
    const data = await request.json();
    const { name, email, service, message } = data;

    // 2. Validation de base (pour éviter les formulaires vides)
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nom, email et message sont obligatoires" },
        { status: 400 }
      );
    }

    // 3. ICI : Plus tard, on mettra le code pour envoyer vers Google Sheets ou Email
    // Pour l'instant, on affiche les données dans le terminal de VS Code pour prouver que ça marche
    console.log("🔔 NOUVELLE DEMANDE DE DEVIS REÇUE !");
    console.log("Nom:", name);
    console.log("Email:", email);
    console.log("Service:", service);
    console.log("Message:", message);

    // 4. On renvoie un message de succès au site web
    return NextResponse.json(
      { success: true, message: "Demande envoyée avec succès !" },
      { status: 200 }
    );
   
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}