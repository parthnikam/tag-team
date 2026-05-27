import { type User } from "@supabase/supabase-js";
import { type RoomRole } from "@/lib/roles";
import { type createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function claimRoomRoleForUser({
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

  const typedRoom = room as unknown as Record<string, string | null>;
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

  const { data: existingRoletaker, error: existingRoletakerError } = await supabase
    .from("roletakers")
    .select("id")
    .eq("roomCode", code)
    .eq("user_id", user.id)
    .eq("role", role)
    .maybeSingle();

  if (existingRoletakerError) {
    return { allowed: false, room, error: existingRoletakerError };
  }

  if (!existingRoletaker) {
    const { error: roletakersError } = await supabase
      .from("roletakers")
      .insert([
        {
          roomCode: code,
          user_id: user.id,
          role,
          userName: displayName,
        },
      ]);

    if (roletakersError) {
      return { allowed: false, room, error: roletakersError };
    }
  }

  return { allowed: true, room, error: null };
}
