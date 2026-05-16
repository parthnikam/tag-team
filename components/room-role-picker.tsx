"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenText, Clock3, Mic } from "lucide-react";
import { ROOM_ROLES, ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";

type OccupiedRoles = Partial<Record<RoomRole, string | null>>;

const ROLE_META: Record<
  RoomRole,
  {
    description: string;
    icon: typeof Clock3;
  }
> = {
  timer: {
    description: "Track speech durations live",
    icon: Clock3,
  },
  ahcounter: {
    description: "Tap to tally filler words",
    icon: Mic,
  },
  grammarian: {
    description: "Note language usage",
    icon: BookOpenText,
  },
};

export default function RoomRolePicker({
  code,
  occupiedRoles,
  roleAssignments,
  currentUserId,
  currentUserName,
}: {
  code: string;
  occupiedRoles: OccupiedRoles;
  roleAssignments: OccupiedRoles;
  currentUserId: string | null;
  currentUserName: string;
}) {
  const router = useRouter();
  const [participantName] = useState(() => {
    if (typeof window === "undefined") {
      return currentUserName;
    }

    const storedName = window.sessionStorage.getItem("toastmasters-display-name");
    return storedName?.trim() || currentUserName;
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleJoin = (selectedRole: RoomRole) => {
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/joinroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          role: selectedRole,
          name: participantName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not join this role.");
        return;
      }

      if (participantName.trim()) {
        window.sessionStorage.removeItem("toastmasters-display-name");
      }

      router.push(`/room/${code}/${selectedRole}`);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.04em] text-[#0A0A0A]">
          Choose your TAG role
        </h2>
        <p className="mt-1 text-sm text-[#667085]">
          One person per role. Updates live.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {ROOM_ROLES.map((role) => {
        const occupant = occupiedRoles[role] ?? null;
        const assignedUserId = roleAssignments[role] ?? null;
        const isTakenBySomeoneElse = Boolean(assignedUserId && assignedUserId !== currentUserId);
        const meta = ROLE_META[role];
        const Icon = meta.icon;

        return (
          <button
            key={role}
            type="button"
            disabled={isTakenBySomeoneElse || isPending}
            onClick={() => handleJoin(role)}
            className={`flex items-center gap-4 rounded-[1.7rem] border px-5 py-4 text-left transition-colors ${
              isTakenBySomeoneElse
                ? "cursor-not-allowed border-[#EAEAEA] bg-white opacity-40"
                : "border-[#EAEAEA] bg-white hover:bg-[#F7F7F7]"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]">
              <Icon className="h-4.5 w-4.5 text-[#0A0A0A]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[1.4rem] font-semibold tracking-[-0.04em] text-[#0A0A0A]">
                {ROOM_ROLE_LABELS[role]}
              </div>
              <div className="mt-0.5 text-sm text-[#667085]">
                {isTakenBySomeoneElse
                  ? `This role is already taken by ${occupant}`
                  : assignedUserId === currentUserId
                    ? "Open your live role view"
                    : meta.description}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-[#0A0A0A]" />
          </button>
        );
        })}
      </div>

      {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
    </div>
  );
}
