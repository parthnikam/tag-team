"use server";

import { ROOM_ROLES, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

const buildDummyData = (code: string, role: RoomRole, userId: string) => ({
  roomCode: code,
  role,
  submittedBy: userId,
  submittedAt: new Date().toISOString(),
  entries: [
    {
      label: "sample",
      value: `${role}-demo`,
    },
  ],
});

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
    return Response.json({ error: "Invalid submission" }, { status: 400 });
  }

  const typedRole = role as RoomRole;

  const { data: existingRow, error: existingError } = await supabase
    .from("reports")
    .select(`room_id, ${typedRole}`)
    .eq("room_id", code)
    .maybeSingle();

  if (existingError) {
    return Response.json({ error: existingError.message }, { status: 500 });
  }

  if (existingRow && existingRow[typedRole as keyof typeof existingRow]) {
    return Response.json(
      { error: "This role has already submitted data" },
      { status: 409 },
    );
  }

  const payload = buildDummyData(code, typedRole, user.id);

  const { data, error } = await supabase
    .from("reports")
    .upsert({ room_id: code, [typedRole]: payload }, { onConflict: "room_id" })
    .select(`room_id, ${typedRole}`)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    submission: data,
  });
}
