import type { Metadata } from "next";
import "./globals.css";
import ConditionalChrome from "@/components/layout/ConditionalChrome";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  title: "NEW LOOK TECH SERVICE | L'Avenir des Services Techniques",
  description: "Soudure, Construction, Maintenance Industrielle. Des solutions techniques de classe mondiale pour les secteurs miniers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <GoogleAnalytics />
        <ConditionalChrome>
          {children}
        </ConditionalChrome>
      </body>
    </html>
  );
}
