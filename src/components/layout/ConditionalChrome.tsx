"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chatbot/Chatbot";
import VisitTracker from "@/components/analytics/VisitTracker";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith("/dashboard");

  if (isAdmin) {
    return (
      <>
        <VisitTracker />
        {children}
      </>
    );
  }

  return (
    <>
      <VisitTracker />
      <Navbar />
      {children}
      <Footer />
      <Chatbot />
    </>
  );
}
