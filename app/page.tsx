'use client'

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useAuth } from "@/app/providers";


export default function Home() {

  const { user, signOut } = useAuth()
  
  return (
    <div className="bg-background flex flex-col items-center justify-start h-screen p-4 gap-6">
      <div className="h1 text-bold text-4xl text">TAG Team☺</div>

      <button className="text-lg border border-1 border-green-400 text-green-200 p-2 rounded-xl">create room</button>

      <div className="flex flex-row items-center gap-4">
      <input className="border border-1 border-white rounded-lg text-xl p-2"/>
      <button className="text-lg border border-1 border-purple-400 text-purple-200 p-2 rounded-xl">join room</button>
      </div>
    </div>
  );
}
