"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import BackLink from "@/components/back-link";

export default function Page() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleJoinMeeting = () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      return;
    }

    startTransition(() => {
      if (name.trim()) {
        window.sessionStorage.setItem("toastmasters-display-name", name.trim());
      }

      router.push(`/room/${trimmedCode}`);
    });
  };

  return (
    <main className="min-h-screen bg-white px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-[35rem]">
        <BackLink href="/room" label="Back" />

        <section className="mt-5 rounded-[2rem] border border-[#E7E7E7] bg-white px-5 py-6 sm:px-8 sm:py-8">
          <h1 className="text-[2.45rem] font-semibold tracking-[-0.06em] text-[#0A0A0A]">
            Join Meeting
          </h1>
          <p className="mt-2 text-[1rem] leading-7 text-[#667085]">
            Enter the meeting code shared with you.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[1rem] font-semibold text-[#0A0A0A]">Meeting code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                className="w-full rounded-full border border-[#E7E7E7] px-5 py-3 text-center text-[1.15rem] tracking-[0.28em] text-[#475467] outline-none transition-colors placeholder:text-[#667085] hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
                placeholder="ABC123"
                maxLength={6}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[1rem] font-semibold text-[#0A0A0A]">Your name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-full border border-[#E7E7E7] px-5 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
                placeholder="Your name"
              />
            </label>

            <button
              type="button"
              onClick={handleJoinMeeting}
              disabled={isPending || !code.trim()}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0A0A0A] px-7 py-3.5 text-[1rem] font-semibold text-white transition-colors hover:bg-[#222222] disabled:opacity-50"
            >
              {isPending ? "Joining..." : "Continue"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
