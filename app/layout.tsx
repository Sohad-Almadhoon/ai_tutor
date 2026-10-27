import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/AppSidebar";
import ToastProvider from "@/components/ToastProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learnova | Learn out loud",
  description: "Find your voice, meet your AI tutor, and make every lesson count.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", dmSans.variable, spaceGrotesk.variable)}
    >
      <body className="antialiased">
        <ClerkProvider appearance={{ variables: { colorPrimary: "#7357f6" } }}>
          <ToastProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
