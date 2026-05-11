import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/providers";
import { createClient } from "@/utils/supabase/server";


const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
});

export const metadata: Metadata = {title: "TAG Team",description: "Collaborative TAG Team Reports for Toastmasters Meetings.",};


export default async function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const supabase = await createClient();
  const { data: {user}} = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${workSans.variable} h-full antialiased`}
    >
      <body className="dark min-h-full flex flex-col">
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
