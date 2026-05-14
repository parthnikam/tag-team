export const ROOM_ROLES = ["timer", "grammarian", "ahcounter"] as const;

export type RoomRole = (typeof ROOM_ROLES)[number];

export const ROOM_ROLE_LABELS: Record<RoomRole, string> = {
  timer: "Timer",
  grammarian: "Grammarian",
  ahcounter: "Ah-Counter",
};
