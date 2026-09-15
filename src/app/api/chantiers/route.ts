import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Non configuré" }, { status: 500 });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/chantiers?select=*&order=created_at.desc`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const chantiers = await res.json();
    return NextResponse.json(chantiers, { status: 200 });

  } catch (error) {
    console.error("Exception chantiers:", error);
    return NextResponse.json([], { status: 200 });
  }
}
