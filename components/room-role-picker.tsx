"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenText, Clock3, Mic } from "lucide-react";
import { ROOM_ROLES, ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";
import {
  getCachedParticipantName,
  setCachedParticipantName,
  setCachedRoomSession,
} from "@/components/room-session-cache";

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
  const [error, setError] = useState("");
  const [pendingRole, setPendingRole] = useState<RoomRole | null>(null);

  useEffect(() => {
    router.prefetch(`/room/${code}/reports`);
    ROOM_ROLES.forEach((role) => {
      if (roleAssignments[role] === currentUserId) {
        router.prefetch(`/room/${code}/${role}`);
      }
    });
  }, [code, currentUserId, roleAssignments, router]);

  const handleJoin = (selectedRole: RoomRole) => {
    setError("");
    setPendingRole(selectedRole);
    const participantName = getCachedParticipantName(code, currentUserName);

    setCachedParticipantName(code, participantName);
    setCachedRoomSession({
      code,
      occupiedRoles: { [selectedRole]: participantName },
      roleAssignments: { [selectedRole]: currentUserId },
    });

    router.push(`/room/${code}/${selectedRole}`);

    void (async () => {
      try {
        await fetch("/api/joinroom", {
          method: "POST",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            role: selectedRole,
            name: participantName,
          }),
        });
      } catch {
        // The destination page also claims the role; this request preserves history.
      }
    })();
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.04em] text-[#0A0A0A]">
          Choose your TAG role
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {ROOM_ROLES.map((role) => {
        const occupant = occupiedRoles[role] ?? null;
        const assignedUserId = roleAssignments[role] ?? null;
        const isTakenBySomeoneElse = Boolean(assignedUserId && assignedUserId !== currentUserId);
        const isOpening = pendingRole === role;
        const meta = ROLE_META[role];
        const Icon = meta.icon;

        return (
          <button
            key={role}
            type="button"
            disabled={isTakenBySomeoneElse || isOpening}
            onPointerEnter={() => {
              if (assignedUserId === currentUserId) {
                router.prefetch(`/room/${code}/${role}`);
              }
            }}
            onFocus={() => {
              if (assignedUserId === currentUserId) {
                router.prefetch(`/room/${code}/${role}`);
              }
            }}
            onClick={() => handleJoin(role)}
            className={`flex items-center gap-4 rounded-[1.7rem] px-5 py-4 text-left transition-colors ${
              isTakenBySomeoneElse
                ? "cursor-not-allowed  bg-white opacity-40"
                : "bg-white"
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
                  : isOpening
                    ? "Opening your live role view"
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
