"use client";

import { User } from "@supabase/supabase-js";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function NavAvatar({ user }: { user: User | null }) {
  const { signOut } = useAuth();
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm "
        >
          {initials}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-flat-card p-2 shadow-lg">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-foreground">
                {user.user_metadata?.full_name || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <div className="my-1 "/>
              <Link
                href="/meetings"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-foreground transition-colors"
              >
                Past meetings
              </Link>

              <Link
                href="/"
                onClick={signOut}
                className="block px-3 py-2 text-sm font-medium text-foreground transition-colors"
              >
                Logout
              </Link>
          </div>
        )}
      </div>
    </div>
  );
}
