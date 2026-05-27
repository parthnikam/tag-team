"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getCachedParticipantName,
  setCachedParticipantName,
  setCachedRoomSession,
} from "@/components/room-session-cache";
import { type RoomRole } from "@/lib/roles";

export default function RoomJoinedNameField({
  code,
  initialName,
  currentRole,
}: {
  code: string;
  initialName: string;
  currentRole: RoomRole | null;
}) {
  const [name, setName] = useState(() => getCachedParticipantName(code, initialName));
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    setCachedParticipantName(code, trimmedName);

    if (currentRole) {
      setCachedRoomSession({
        code,
        occupiedRoles: { [currentRole]: trimmedName },
      });
    }
  }, [code, currentRole, name]);

  const saveName = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Enter a display name.");
      return;
    }

    setError("");
    setCachedParticipantName(code, trimmedName);

    if (!currentRole) {
      return;
    }

    setCachedRoomSession({
      code,
      occupiedRoles: { [currentRole]: trimmedName },
    });

    startTransition(async () => {
      const response = await fetch("/api/updateroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          role: currentRole,
          updates: {
            [`${currentRole}_name`]: trimmedName,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not save name.");
      }
    });
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <label className="text-xs font-normal text-[1rem] text-muted-foreground">
        Joining as
      </label>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={saveName}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="w-40 rounded-full border border-border bg-card/10 pl-2 py-1 text-sm font-semibold text-foreground outline-none transition-colors  backdrop-blur-xl focus:border-primary sm:w-48"
        aria-label="Joined as"
      />
      {error ? <p className="basis-full text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
