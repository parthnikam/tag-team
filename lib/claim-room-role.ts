import { type User } from "@supabase/supabase-js";
import { type RoomRole } from "@/lib/roles";
import { type createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function claimRoomRole({
  supabase,
  code,
  role,
  user,
  participantName,
  extraSelect = "",
}: {
  supabase: SupabaseClient;
  code: string;
  role: RoomRole;
  user: User | null;
  participantName?: string;
  extraSelect?: string;
}) {
  if (!user) {
    return { allowed: false, room: null, error: null };
  }

  const roleNameColumn = `${role}_name`;
  const selectColumns = [role, roleNameColumn, extraSelect].filter(Boolean).join(", ");

  const { data: room, error } = await supabase
    .from("room")
    .select(selectColumns)
    .eq("code", code)
    .maybeSingle();

  if (error || !room) {
    return { allowed: false, room, error };
  }

  const typedRoom = room as Record<string, string | null>;
  const occupant = typedRoom[role];

  if (occupant && occupant !== user.id) {
    return { allowed: false, room, error: null };
  }

  const displayName =
    participantName?.trim() ||
    user.user_metadata?.full_name ||
    user.email ||
    "Anonymous";

  if (occupant !== user.id || typedRoom[roleNameColumn] !== displayName) {
    const { error: updateError } = await supabase
      .from("room")
      .update({ [role]: user.id, [roleNameColumn]: displayName })
      .eq("code", code);

    if (updateError) {
      return { allowed: false, room, error: updateError };
    }
  }

  return { allowed: true, room, error: null };
}
