"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chatbot/Chatbot";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Sur le dashboard admin : interface épurée
  const isAdmin = pathname?.startsWith("/dashboard");

  if (isAdmin) {
    return <>{children}</>;
  }

  // Sur tout le site public : nav + contenu + footer + chatbot
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <Chatbot />
    </>
  );
}
