import { NextResponse } from "next/server";

/* POST : enregistrer une visite (appelé par le site) */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const { page } = await request.json();
    const userAgent = request.headers.get("user-agent") || "";

    // On ignore les robots/preview (contenu "HeadlessChrome")
    if (userAgent.includes("HeadlessChrome")) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await fetch(`${supabaseUrl}/rest/v1/visites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        page: page || "/",
        user_agent: userAgent.slice(0, 500),
      }),
    });

    return NextResponse.json({ ok: true }, { status: 200 });

  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

/* GET : stats agrégées pour le dashboard */
export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Non configuré" }, { status: 500 });
    }

    // Statistiques par période (7 derniers jours, 30 derniers jours, total)
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Comptage total
    const totalRes = await fetch(
      `${supabaseUrl}/rest/v1/visites?id=not.is.null&select=id`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "count=exact",
          "Range": "0-0",
        },
      }
    );
    const totalRange = totalRes.headers.get("content-range") || "0/0";
    const total = parseInt(totalRange.split("/")[1] || "0", 10);

    // Comptage 30 jours
    const m30Res = await fetch(
      `${supabaseUrl}/rest/v1/visites?created_at=gte.${d30}&select=id`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "count=exact",
          "Range": "0-0",
        },
      }
    );
    const m30Range = m30Res.headers.get("content-range") || "0/0";
    const last30 = parseInt(m30Range.split("/")[1] || "0", 10);

    // Comptage 7 jours
    const d7Res = await fetch(
      `${supabaseUrl}/rest/v1/visites?created_at=gte.${d7}&select=id`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "count=exact",
          "Range": "0-0",
        },
      }
    );
    const d7Range = d7Res.headers.get("content-range") || "0/0";
    const last7 = parseInt(d7Range.split("/")[1] || "0", 10);

    return NextResponse.json({ total, last30, last7 }, { status: 200 });

  } catch (error) {
    console.error("Erreur stats visites:", error);
    return NextResponse.json({ total: 0, last30: 0, last7: 0 }, { status: 200 });
  }
}
