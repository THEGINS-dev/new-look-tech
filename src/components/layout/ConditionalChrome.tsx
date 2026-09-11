"use client";

import { usePathname } from "next/navigation";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Sur le dashboard admin : interface épurée, sans navbar/chatbot/footer
  const isAdmin = pathname?.startsWith("/dashboard");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <Chatbot />
    </>
  );
}
