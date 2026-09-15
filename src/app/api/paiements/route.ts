import { NextResponse } from "next/server";

/* GET : tous les paiements avec titre du chantier */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Non configuré" }, { status: 500 });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/paiements?select=*,chantiers(titre)&order=date_paiement.desc`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) return NextResponse.json([], { status: 200 });

    const data = await res.json();
    const formatted = data.map((p: any) => ({
      ...p,
      chantier_titre: p.chantiers?.titre || "Chantier supprimé",
    }));

    return NextResponse.json(formatted, { status: 200 });

  } catch (error) {
    console.error("Exception paiements GET:", error);
    return NextResponse.json([], { status: 200 });
  }
}

/* POST : ajouter un paiement */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Non configuré" }, { status: 500 });
    }

    const body = await request.json();
    const { chantier_id, montant, devise, moyen, note } = body;

    if (!chantier_id || !montant) {
      return NextResponse.json({ error: "chantier_id et montant obligatoires" }, { status: 400 });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/paiements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        chantier_id,
        montant: parseFloat(montant),
        devise: devise || "USD",
        moyen: moyen || null,
        note: note || null,
      }),
    });

    if (!res.ok) {
      console.error("Erreur création paiement:", await res.text());
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    const created = await res.json();
    return NextResponse.json(created, { status: 200 });

  } catch (error) {
    console.error("Exception paiements POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/* DELETE : supprimer un paiement */
export async function DELETE(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Non configuré" }, { status: 500 });
    }

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    await fetch(`${supabaseUrl}/rest/v1/paiements?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (error) {
    console.error("Exception paiements DELETE:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
