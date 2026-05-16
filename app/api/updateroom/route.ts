"use server";

import { ROOM_ROLES, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

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

  const { data, error } = await supabase
    .from("room")
    .update(updates)
    .eq("code", code)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ room: data });
}
