import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/AppSidebar";

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
          <div className="flex min-h-screen">
            <AppSidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
