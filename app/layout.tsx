import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/providers";
import { createClient } from "@/utils/supabase/server";
import NavAvatar from "@/components/nav-avatar";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {title: "TAG Team",description: "Collaborative TAG Team Reports for Toastmasters Meetings.",};


export default async function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const supabase = await createClient();
  const { data: {user}} = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#0A0A0A]">
        <AuthProvider initialUser={user}>
          {/* <NavAvatar user={user} /> */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
