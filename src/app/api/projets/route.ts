import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json([]);
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/projets?published=eq.true&order=created_at.desc`,
      {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        // Cache : le site recharge les projets toutes les 60 secondes max
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error("Erreur lecture projets:", response.status);
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Exception projets:", error);
    return NextResponse.json([]);
  }
}
