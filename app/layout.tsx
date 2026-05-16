import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/providers";
import { createClient } from "@/utils/supabase/server";
import NavAvatar from "@/components/nav-avatar";
import { Analytics } from "@vercel/analytics/next"


const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Toastmasters TAG Team App",
  description: "Collaborative Timer, Ah-Counter, and Grammarian (TAG) Team Reports for Toastmasters Meetings.",
  keywords: ["Toastmasters", "TAG Team", "Timer", "Ah-Counter", "Grammarian", "Meeting Reports"],
  authors: [{ name: "Toastmasters TAG Team" }],
  openGraph: {
    title: "Toastmasters TAG Team App",
    description: "Collaborative Timer, Ah-Counter, and Grammarian (TAG) Team Reports for Toastmasters Meetings.",
    siteName: "TAG Team App",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toastmasters TAG Team App",
    description: "Collaborative Timer, Ah-Counter, and Grammarian (TAG) Team Reports for Toastmasters Meetings.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};


export default async function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const supabase = await createClient();
  const { data: {user}} = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#0A0A0A]">
        <Analytics />
        <AuthProvider initialUser={user}>
          <NavAvatar user={user} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
