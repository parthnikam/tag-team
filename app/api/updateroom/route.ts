import { ROOM_ROLES, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

const getAllowedUpdateKeys = (role: RoomRole) =>
  role === "grammarian"
    ? [`${role}_name`, "wod", "meaning"]
    : [`${role}_name`];

const getSafeUpdates = (
  role: RoomRole,
  updates: Record<string, string | null>,
) => {
  const allowedKeys = new Set(getAllowedUpdateKeys(role));
  const entries = Object.entries(updates);

  if (!entries.length || entries.some(([key]) => !allowedKeys.has(key))) {
    return null;
  }

  return Object.fromEntries(entries) as Record<string, string | null>;
};

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const { code, role, updates } = (await req.json()) as {
    code?: string;
    role?: string;
    updates?: Record<string, string | null>;
  };

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!code || !role || !ROOM_ROLES.includes(role as RoomRole) || !updates) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const typedRole = role as RoomRole;
  const safeUpdates = getSafeUpdates(typedRole, updates);

  if (!safeUpdates) {
    return Response.json({ error: "Invalid update fields" }, { status: 400 });
  }

  // Verify that the user is assigned to this role
  const { data: room, error: roomError } = await supabase
    .from("room")
    .select(typedRole)
    .eq("code", code)
    .maybeSingle();

  if (roomError) {
    return Response.json({ error: roomError.message }, { status: 500 });
  }

  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  if ((room as unknown as Record<RoomRole, string | null>)[typedRole] !== user.id) {
    return Response.json(
      { error: "You are not assigned to this role" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("room")
    .update(safeUpdates)
    .eq("code", code);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const updatedRoleName = safeUpdates[`${typedRole}_name`];

  if (updatedRoleName) {
    const { error: roletakersError } = await supabase
      .from("roletakers")
      .update({ userName: updatedRoleName })
      .eq("roomCode", code)
      .eq("user_id", user.id)
      .eq("role", typedRole);

    if (roletakersError) {
      return Response.json({ error: roletakersError.message }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}
