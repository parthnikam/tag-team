"use server";

import { ROOM_ROLES, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const { code, role } = (await req.json()) as { code?: string; role?: string };

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!code || !role || !ROOM_ROLES.includes(role as RoomRole)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const typedRole = role as RoomRole;

  const { data: room, error: roomError } = await supabase
    .from("room")
    .select(`code, ${ROOM_ROLES.join(", ")}`)
    .eq("code", code)
    .maybeSingle();

  if (roomError) {
    return Response.json({ error: roomError.message }, { status: 500 });
  }

  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  const occupant = room[typedRole];

  if (occupant && occupant !== user.id) {
    return Response.json(
      { error: "That role is already occupied" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("room")
    .update({ [typedRole]: user.id })
    .eq("code", code)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    room: data,
  });
}
