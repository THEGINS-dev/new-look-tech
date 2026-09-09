import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, entreprise, service, localisation, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const whatsappLink = `https://wa.me/${phone?.replace(/\D/g, '')}?text=Bonjour%20${name}%20de%20NEW%20LOOK%20TECH%20ici`;

    const result = await resend.emails.send({
      from: "New Look Tech <onboarding@resend.dev>",
      to: ["newlooktechservice@gmail.com"],
      replyTo: email,
      subject: `🔔 NOUVEAU DEVIS: ${service} - ${name} (${localisation})`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #FF8C00; border-radius: 15px; overflow: hidden;">
          
          <div style="background: linear-gradient(90deg, #FF8C00, #ff6a00); padding: 20px; text-align: center;">
            <h1 style="color: #000; margin: 0; font-size: 22px;">NEW LOOK TECH</h1>
            <p style="color: #000; margin: 5px 0 0; font-size: 12px;">L'EXCELLENCE TECHNIQUE AU POINT MODERNE</p>
          </div>

          <div style="padding: 25px; color: #fff;">
            <h2 style="color: #FF8C00; margin-top: 0;">Nouvelle Demande de Devis</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr style="background: #1a1a1a;">
                <td style="padding: 12px; border: 1px solid #333; color: #aaa; width: 35%;">Nom complet</td>
                <td style="padding: 12px; border: 1px solid #333; color: #fff; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #333; color: #aaa;">Entreprise</td>
                <td style="padding: 12px; border: 1px solid #333; color: #fff;">${entreprise || 'Non renseigné'}</td>
              </tr>
              <tr style="background: #1a1a1a;">
                <td style="padding: 12px; border: 1px solid #333; color: #aaa;">Téléphone</td>
                <td style="padding: 12px; border: 1px solid #333;"><a href="tel:${phone}" style="color: #FF8C00; text-decoration: none; font-weight: bold;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #333; color: #aaa;">Email</td>
                <td style="padding: 12px; border: 1px solid #333;"><a href="mailto:${email}" style="color: #00d4ff; text-decoration: none;">${email}</a></td>
              </tr>
              <tr style="background: #1a1a1a;">
                <td style="padding: 12px; border: 1px solid #333; color: #aaa;">Service</td>
                <td style="padding: 12px; border: 1px solid #333; color: #FF8C00; font-weight: bold;">${service}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #333; color: #aaa;">Localisation</td>
                <td style="padding: 12px; border: 1px solid #333; color: #fff;">${localisation}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; background: #1a1a1a; padding: 15px; border-radius: 10px; border-left: 4px solid #FF8C00;">
              <p style="color: #aaa; margin: 0 0 10px;">Message du client :</p>
              <p style="color: #fff; margin: 0; line-height: 1.6;">${message}</p>
            </div>

            <div style="margin-top: 25px; text-align: center;">
              <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #fff; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 5px;">💬 Répondre sur WhatsApp</a>
              <a href="mailto:${email}?subject=Re: Votre demande ${service} - NEW LOOK TECH" style="display: inline-block; background: #FF8C00; color: #000; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 5px;">📧 Répondre par Email</a>
            </div>

          </div>
          
          <div style="background: #000; padding: 15px; text-align: center; font-size: 11px; color: #666;">
            Email envoyé depuis new-look-tech-gcf3.vercel.app | Megastore, Av. Kafubu, Lubumbashi, RDC
          </div>
        </div>
      </div>
      `,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
           }
