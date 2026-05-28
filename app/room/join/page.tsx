"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import BackLink from "@/components/back-link";
import { setCachedParticipantName } from "@/components/room-session-cache";

export default function Page() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleJoinMeeting = () => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      return;
    }

    startTransition(() => {
      if (trimmedName) {
        window.sessionStorage.setItem("toastmasters-display-name", trimmedName);
        setCachedParticipantName(trimmedCode, trimmedName);
      }

      router.push(`/room/${trimmedCode}`);
    });
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <BackLink href="/room" label="Back" />

        <section className="mt-4 rounded-[2rem] border border-border bg-card p-4 sm:p-6">
          <div className="page-heading-inset">
          <h1 className="text-[2.45rem] font-semibold tracking-[-0.06em] text-foreground">
            Join Meeting
          </h1>
          <p className="mt-2 text-[1rem] leading-7 text-muted-foreground">
            Enter the meeting code shared with you.
          </p>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-[1rem] font-semibold text-foreground">Meeting code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                className="w-full rounded-full border border-border px-5 py-3 text-center text-[1.15rem] tracking-[0.28em] text-muted-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder="123456"
                maxLength={6}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[1rem] font-semibold text-foreground">Your name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-full border border-border px-5 py-3 text-[1rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder="Your name"
              />
            </label>

            <button
              type="button"
              onClick={handleJoinMeeting}
              disabled={isPending || !code.trim()}
              className="button-outset-primary inline-flex w-full items-center justify-center gap-3 rounded-full px-7 py-3.5 text-[1rem] font-semibold"
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
