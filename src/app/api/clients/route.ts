import { NextResponse } from "next/server";

/* GET : liste tous les clients avec le nombre de demandes associées */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Non configuré" }, { status: 500 });
    }

    // 1. Récupérer tous les clients (du plus récent au plus ancien)
    const clientsRes = await fetch(
      `${supabaseUrl}/rest/v1/clients?select=*&order=created_at.desc`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 30 },
      }
    );

    if (!clientsRes.ok) {
      console.error("Erreur lecture clients:", clientsRes.status);
      return NextResponse.json([]);
    }

    const clients = await clientsRes.json();

    // 2. Récupérer TOUTES les demandes (pour compter par client)
    const demandesRes = await fetch(
      `${supabaseUrl}/rest/v1/demandes?select=id,client_id,status,email`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    const demandes = demandesRes.ok ? await demandesRes.json() : [];

    // 3. Enrichir chaque client avec ses statistiques
    const enrichedClients = clients.map((client: any) => {
      // Demandes liées via client_id OU via email (pour les anciennes demandes)
      const clientDemandes = demandes.filter(
        (d: any) =>
          d.client_id === client.id ||
          (d.email && d.email.toLowerCase() === client.email.toLowerCase())
      );

      return {
        ...client,
        nb_demandes: clientDemandes.length,
        nb_gagnees: clientDemandes.filter((d: any) => d.status === "gagne").length,
        nb_en_cours: clientDemandes.filter((d) => d.status === "en_cours").length,
      };
    });

    // Trier : les clients avec le plus de demandes en premier
    enrichedClients.sort((a: any, b: any) => b.nb_demandes - a.nb_demandes);

    return NextResponse.json(enrichedClients, { status: 200 });

  } catch (error) {
    console.error("Exception clients:", error);
    return NextResponse.json([], { status: 200 });
  }
}
