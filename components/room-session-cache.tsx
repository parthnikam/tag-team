"use client";

import { useEffect, useState } from "react";
import { type RoomRole } from "@/lib/roles";
import { participantNameCookie } from "@/lib/room-session-keys";

type RoleMap = Partial<Record<RoomRole, string | null>>;

export interface CachedRoomSession {
  code: string;
  clubName?: string | null;
  hostName?: string | null;
  occupiedRoles?: RoleMap;
  roleAssignments?: RoleMap;
  wod?: string | null;
  meaning?: string | null;
}

const cacheKey = (code: string) => `toastmasters-room:${code}`;
const participantNameKey = (code: string) => `toastmasters-room:${code}:participant-name`;
const cacheEvent = "toastmasters-room-cache";
const participantNameEvent = "toastmasters-participant-name";

export const getCachedRoomSession = (code: string): CachedRoomSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window.sessionStorage.getItem(cacheKey(code));

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as CachedRoomSession;
  } catch {
    window.sessionStorage.removeItem(cacheKey(code));
    return null;
  }
};

export const setCachedRoomSession = (room: CachedRoomSession) => {
  if (typeof window === "undefined") {
    return;
  }

  const existing = getCachedRoomSession(room.code);
  const updatedRoom = {
    ...existing,
    ...room,
    occupiedRoles: {
      ...existing?.occupiedRoles,
      ...room.occupiedRoles,
    },
    roleAssignments: {
      ...existing?.roleAssignments,
      ...room.roleAssignments,
    },
  };

  window.sessionStorage.setItem(
    cacheKey(room.code),
    JSON.stringify(updatedRoom),
  );
  window.dispatchEvent(new CustomEvent<CachedRoomSession>(cacheEvent, { detail: updatedRoom }));
};

export const getCachedParticipantName = (code: string, fallback = "") => {
  if (typeof window === "undefined") {
    return fallback;
  }

  return (
    window.sessionStorage.getItem(participantNameKey(code))?.trim() ||
    window.sessionStorage.getItem("toastmasters-display-name")?.trim() ||
    fallback
  );
};

export const setCachedParticipantName = (code: string, name: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const trimmedName = name.trim();

  if (trimmedName) {
    window.sessionStorage.setItem(participantNameKey(code), trimmedName);
    document.cookie = `${participantNameCookie(code)}=${encodeURIComponent(trimmedName)}; path=/; max-age=2592000; samesite=lax`;
  } else {
    window.sessionStorage.removeItem(participantNameKey(code));
    document.cookie = `${participantNameCookie(code)}=; path=/; max-age=0; samesite=lax`;
  }

  window.dispatchEvent(
    new CustomEvent<{ code: string; name: string }>(participantNameEvent, {
      detail: { code, name: trimmedName },
    }),
  );
};

export function RoomSessionSeed({ room }: { room: CachedRoomSession }) {
  useEffect(() => {
    setCachedRoomSession(room);
  }, [room]);

  return null;
}

export function useCachedRoomSession(code: string) {
  const [room, setRoom] = useState<CachedRoomSession | null>(() =>
    getCachedRoomSession(code),
  );

  useEffect(() => {
    const handleCacheUpdate = (event: Event) => {
      const updatedRoom = (event as CustomEvent<CachedRoomSession>).detail;

      if (updatedRoom.code === code) {
        setRoom(updatedRoom);
      }
    };

    window.addEventListener(cacheEvent, handleCacheUpdate);

    return () => {
      window.removeEventListener(cacheEvent, handleCacheUpdate);
    };
  }, [code]);

  return room;
}

export function useCachedParticipantName(code: string, fallback = "") {
  const [name, setName] = useState(() => getCachedParticipantName(code, fallback));

  useEffect(() => {
    const handleNameUpdate = (event: Event) => {
      const updatedName = (event as CustomEvent<{ code: string; name: string }>).detail;

      if (updatedName.code === code) {
        setName(updatedName.name || fallback);
      }
    };

    window.addEventListener(participantNameEvent, handleNameUpdate);

    return () => {
      window.removeEventListener(participantNameEvent, handleNameUpdate);
    };
  }, [code, fallback]);

  return name;
}
