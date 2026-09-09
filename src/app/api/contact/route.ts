import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, entreprise, service, localisation, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    await resend.emails.send({
      from: "New Look Tech <onboarding@resend.dev>",
      to: ["newlooktechservice@gmail.com"],
      replyTo: email,
      subject: `NOUVEAU DEVIS ${service} - ${name}`,
      html: `
        <h2>Nouveau devis - ${name}</h2>
        <p><b>Nom:</b> ${name}</p>
        <p><b>Email:</b> <a href="mailto:${email}">${email}</a></p>
        <p><b>Tel:</b> <a href="tel:${phone}">${phone}</a> | <a href="https://wa.me/${phone?.replace(/\D/g,'')}">WhatsApp</a></p>
        <p><b>Service:</b> ${service}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
