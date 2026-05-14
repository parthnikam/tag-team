"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROOM_ROLES, ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";

type OccupiedRoles = Partial<Record<RoomRole, string | null>>;

export default function RoomRolePicker({
  code,
  occupiedRoles,
  currentUserId,
}: {
  code: string;
  occupiedRoles: OccupiedRoles;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoomRole | "">("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleJoin = () => {
    if (!selectedRole) {
      return;
    }

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not join this role.");
        return;
      }

      router.push(`/room/${code}/${selectedRole}`);
    });
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      {ROOM_ROLES.map((role) => {
        const occupant = occupiedRoles[role] ?? null;
        const isTakenBySomeoneElse = Boolean(occupant && occupant !== currentUserId);
        const isSelected = selectedRole === role;

        return (
          <button
            key={role}
            type="button"
            disabled={isTakenBySomeoneElse || isPending}
            onClick={() => setSelectedRole(role)}
            className={`rounded border p-2 text-left text-sm ${
              isSelected ? "border-white bg-white text-black" : "border-white/20"
            } ${isTakenBySomeoneElse ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <div>{ROOM_ROLE_LABELS[role]}</div>
            <div className="text-xs opacity-70">
              {isTakenBySomeoneElse
                ? "Occupied"
                : occupant === currentUserId
                  ? "Already joined by you"
                  : "Available"}
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleJoin}
        disabled={!selectedRole || isPending}
        className="rounded border p-2 text-sm disabled:opacity-50"
      >
        {isPending ? "Joining..." : "Join role"}
      </button>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
