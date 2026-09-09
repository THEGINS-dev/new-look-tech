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
            <img src="https://new-look-tech.vercel.app/Logo.jpg" alt="New Look Tech" style="width: 85px; height: 85px; object-fit: contain; background: white; border-radius: 14px; padding: 8px; display: block; margin: 0 auto 12px auto;">
            <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: 800;">NEW LOOK TECH</h1>
            <p style="color: white; margin: 2px 0 0 0; font-size: 14px; font-weight: 800; letter-spacing: 2px;">SERVICE</p>
            <p style="color: #fff; opacity: 0.9; margin: 8px 0 0 0; font-size: 11px; letter-spacing: 2px;">EXCELLENCE TECHNIQUE AU POINT MODERNE</p>
          </div>
          <div style="padding: 30px; color: #fff;">
            <h2 style="color: #ff8c00; margin-top: 0;">Nouveau Devis Reçu</h2>
            <p style="color: #ccc; font-size: 14px;">Vous avez une nouvelle demande depuis nouvelle-technologie-vercel.app</p>
            
            <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff6b00;">
              <p style="margin: 10px 0;"><span style="color: #888; font-size: 12px; text-transform: uppercase;">Nom Complet</span><br><span style="font-size: 16px; font-weight: bold;">${name}</span></p>
              <p style="margin: 10px 0;"><span style="color: #888; font-size: 12px; text-transform: uppercase;">Email</span><br><a href="mailto:${email}" style="color: #ff8c00; text-decoration: none;">${email}</a></p>
              <p style="margin: 10px 0;"><span style="color: #888; font-size: 12px; text-transform: uppercase;">Téléphone / WhatsApp</span><br><a href="https://wa.me/${phone}"
