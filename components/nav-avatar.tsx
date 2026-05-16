"use client";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function NavAvatar({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A0A0A] text-sm font-semibold text-white shadow-sm ring-2 ring-white hover:bg-[#222222] transition-colors"
        >
          {initials}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#EAEAEA] bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-[#0A0A0A]">
                {user.user_metadata?.full_name || "User"}
              </p>
              <p className="truncate text-xs text-[#6B6B6B]">
                {user.email}
              </p>
            </div>
            <div className="my-1 border-t border-[#EAEAEA]" />
            <Link
              href="/meetings"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7]"
            >
              My Meetings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
