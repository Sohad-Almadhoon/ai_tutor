import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/lib/utils";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Converso",
  description: "Real-time AI Teaching Platform",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", bricolage.variable)}>
      <body className="antialiased">
        <ClerkProvider appearance={{variables : {colorPrimary:"#FE5933"}}}>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
