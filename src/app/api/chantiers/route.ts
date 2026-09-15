import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Non configuré" }, { status: 500 });
    }

    // 1. Chantiers
    const res = await fetch(
      `${supabaseUrl}/rest/v1/chantiers?select=*&order=created_at.desc`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) return NextResponse.json([], { status: 200 });
    const chantiers = await res.json();

    // 2. Clients (pour les noms)
    const clientsRes = await fetch(
      `${supabaseUrl}/rest/v1/clients?select=id,name,company`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );
    const clients = clientsRes.ok ? await clientsRes.json() : [];

    // 3. Paiements (pour les calculs)
    const paiementsRes = await fetch(
      `${supabaseUrl}/rest/v1/paiements?select=*`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );
    const paiements = paiementsRes.ok ? await paiementsRes.json() : [];

    // 4. Enrichir chaque chantier
    const enriched = chantiers.map((c: any) => {
      const client = clients.find((cl: any) => cl.id === c.client_id);
      const chantierPaiements = paiements.filter((p: any) => p.chantier_id === c.id);
      return {
        ...c,
        client_name: client?.name || null,
        client_company: client?.company || null,
        paiements: chantierPaiements,
        total_paye_usd: chantierPaiements.filter((p: any) => p.devise === "USD").reduce((s: number, p: any) => s + p.montant, 0),
        total_paye_cdf: chantierPaiements.filter((p: any) => p.devise === "CDF").reduce((s: number, p: any) => s + p.montant, 0),
      };
    });

    return NextResponse.json(enriched, { status: 200 });

  } catch (error) {
    console.error("Exception chantiers:", error);
    return NextResponse.json([], { status: 200 });
  }
}
