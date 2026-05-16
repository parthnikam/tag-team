"use client";

import Link from "next/link";

export default function Page() {
  return (
    <main className="page-shell">
      <div className="mx-auto flex min-h-[72vh] max-w-4xl flex-col items-center justify-center text-center">
        <h1 className="max-w-3xl text-[3.4rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#0A0A0A] sm:text-[4.9rem]">
          Run Toastmasters meetings smoothly.
        </h1>

        <p className="mt-5 max-w-xl text-[1rem] leading-7 text-[#667085] sm:text-[1.1rem]">
          Minimal tools for Timer, Ah Counter, and Grammarian teams.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/room/create"
            className="inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-[#222222]"
          >
            Create meeting
          </Link>

          <Link
            href="/room/join"
            className="inline-flex items-center justify-center rounded-full border border-[#E5E5E5] px-8 py-3 text-base font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7]"
          >
            Join as TAG
          </Link>
        </div>
      </div>
    </main>
  );
}
