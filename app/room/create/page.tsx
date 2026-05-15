"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import BackLink from "@/components/back-link";
import { ROOM_ROLES, ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";

type JoinAs = "host" | RoomRole;

const JOIN_OPTIONS: JoinAs[] = ["host", ...ROOM_ROLES];

export default function Page() {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [clubName, setClubName] = useState("");
  const [joinAs, setJoinAs] = useState<JoinAs>("host");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreateMeeting = () => {
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/createroom", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostName,
            clubName,
            meetingNumber: "1",
            joinAs,
          }),
        });

        const data = await response.json();
        const roomCode = data?.room?.code;

        if (!response.ok || !roomCode) {
          setError(data.error ?? "Could not create meeting.");
          return;
        }

        if (hostName.trim()) {
          window.sessionStorage.setItem("toastmasters-display-name", hostName.trim());
        }

        router.push(`/room/${roomCode}`);
      } catch {
        setError("Could not create meeting.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-white px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-[35rem]">
        <BackLink href="/room" label="Back" />

        <section className="mt-5 rounded-[2rem] border border-[#E7E7E7] bg-white px-5 py-6 sm:px-8 sm:py-8">
          <h1 className="text-[2.45rem] font-semibold tracking-[-0.06em] text-[#0A0A0A]">
            Create Meeting
          </h1>
          <p className="mt-2 text-[1rem] leading-7 text-[#667085]">
            You&apos;ll receive a 6-character code to share with your TAG team.
          </p>

          <div className="mt-7 flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[1rem] font-semibold text-[#0A0A0A]">Your name</span>
              <input
                value={hostName}
                onChange={(event) => setHostName(event.target.value)}
                className="w-full rounded-full border border-[#E7E7E7] px-5 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
                placeholder="Eleanor Vance"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[1rem] font-semibold text-[#0A0A0A]">
                Meeting name (optional)
              </span>
              <input
                value={clubName}
                onChange={(event) => setClubName(event.target.value)}
                className="w-full rounded-full border border-[#E7E7E7] px-5 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
                placeholder="Tuesday Evening Club"
              />
            </label>

            <div>
              <h2 className="text-[1rem] font-semibold text-[#0A0A0A]">
                Will you also take a role?
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
            {JOIN_OPTIONS.map((option) => {
              const isSelected = joinAs === option;
              const label = option === "host" ? "Host only" : ROOM_ROLE_LABELS[option];
              const description =
                option === "host"
                  ? ""
                  : option === "timer"
                    ? "Track speech durations"
                    : option === "ahcounter"
                      ? "Tally filler words"
                      : "Note language usage";

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setJoinAs(option)}
                  className={`rounded-[1.7rem] border px-5 py-4 text-left transition-colors ${
                    isSelected
                      ? "border-[#0A0A0A] bg-white text-[#0A0A0A]"
                      : "border-[#E7E7E7] bg-white text-[#0A0A0A] hover:bg-[#F7F7F7]"
                  }`}
                >
                  <div className="text-[1rem] font-medium">{label}</div>
                  {description ? (
                    <div className="mt-0.5 text-sm text-[#667085]">{description}</div>
                  ) : null}
                </button>
              );
            })}
            </div>

          <button
            type="button"
            onClick={handleCreateMeeting}
            disabled={isPending || !hostName.trim()}
            className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#0A0A0A] px-7 py-3.5 text-[1rem] font-semibold text-white transition-colors hover:bg-[#222222] disabled:opacity-50"
          >
            {isPending ? "Creating meeting..." : "Create Meeting"}
            <ArrowRight className="h-5 w-5" />
          </button>

          {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
