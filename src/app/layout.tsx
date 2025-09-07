import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ['400', '500', '700'],
  variable: "--font-sans",
});


export const metadata: Metadata = {
  title: "Panadería Inteligente",
  description: "Administra tu negocio de pan y postres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", roboto.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
