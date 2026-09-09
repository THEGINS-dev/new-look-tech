import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, service, message } = await request.json();

    await resend.emails.send({
      from: "New Look Tech <onboarding@resend.dev>",
      to: ["newlooktechservice@gmail.com"],
      replyTo: email,
      subject: `🔥 NOUVEAU DEVIS: ${service} - ${name}`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
          <div style="background: linear-gradient(90deg, #ff6b00, #ff8c00); padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: 1px;">NEW LOOK TECH</h1>
            <p style="color: #fff; opacity: 0.9; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">EXCELLENCE TECHNIQUE AU POINT MODERNE</p>
          </div>
          <div style="padding: 30px; color: #fff;">
            <h2 style="color: #ff8c00; margin-top: 0;">Nouveau Devis Reçu</h2>
            <p style="color: #ccc; font-size: 14px;">Vous avez une nouvelle demande depuis nouvelle-technologie-vercel.app</p>
            
            <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff6b00;">
              <p style="margin: 10px 0;"><span style="color: #888; font-size: 12px; text-transform: uppercase;">Nom Complet</span><br><span style="font-size: 16px; font-weight: bold;">${name}</span></p>
              <p style="margin: 10px 0;"><span style="color: #888; font-size: 12px; text-transform: uppercase;">Email</span><br><a href="mailto:${email}" style="color: #ff8c00; text-decoration: none;">${email}</a></p>
              <p style="margin: 10px 0;"><span style="color: #888; font-size: 12px; text-transform: uppercase;">Téléphone / WhatsApp</span><br><a href="https://wa.me/${phone}" style="color: #25D366; text-decoration: none; font-weight: bold;">${phone} | WhatsApp</a></p>
              <p style="margin: 10px 0;"><span style="color: #888; font-size: 12px; text-transform: uppercase;">Service Demandé</span><br><span style="background: #ff6b00; color: white; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: bold;">${service}</span></p>
            </div>

            <div style="background: #222; border-radius: 8px; padding: 20px;">
              <p style="color: #888; font-size: 12px; text-transform: uppercase; margin: 0 0 10px 0;">Message du Client</p>
              <p style="color: #fff; line-height: 1.6; margin: 0; font-style: italic;">"${message}"</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${email}" style="display: inline-block; background: #ff6b00; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 10px;">Répondre par Email</a>
              <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #25D366; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold;">WhatsApp</a>
            </div>
          </div>
          <div style="background: #000; padding: 15px; text-align: center; color: #666; font-size: 11px;">
            New Look Tech Service - Lubumbashi, Katanga, CD<br>
            Cet email a été envoyé automatiquement depuis votre site web
          </div>
        </div>
      </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
                                                                                                                                                  }
