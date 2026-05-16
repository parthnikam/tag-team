"use server";

import { ROOM_ROLES, type RoomRole } from "@/lib/roles";
import { type RoleReportData } from "@/lib/report-data";
import { createClient } from "@/utils/supabase/server";

const buildSubmissionPayload = (
  code: string,
  role: RoomRole,
  userId: string,
  reportData: RoleReportData,
  roletakerName: string,
) => ({
  roomCode: code,
  role,
  submittedBy: userId,
  name: roletakerName,
  submittedAt: new Date().toISOString(),
  data: reportData,
});

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const { code, role, data: reportData } = (await req.json()) as {
    code?: string;
    role?: string;
    data?: RoleReportData;
  };

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !code ||
    !role ||
    !ROOM_ROLES.includes(role as RoomRole) ||
    !reportData ||
    typeof reportData !== "object"
  ) {
    return Response.json({ error: "Invalid submission" }, { status: 400 });
  }

  const typedRole = role as RoomRole;

  const { data: existingRow, error: existingError } = await supabase
    .from("reports")
    .select(`roomCode, ${typedRole}`)
    .eq("roomCode", code)
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

  const payload = buildSubmissionPayload(code, typedRole, user.id, reportData, user.user_metadata.full_name);

  const { data: submission, error: upsertError } = await supabase
    .from("reports")
    .upsert({ roomCode: code, [typedRole]: payload }, { onConflict: "roomCode" })
    .select(`roomCode, ${typedRole}`)
    .single();

  if (upsertError) {
    return Response.json({ error: upsertError.message }, { status: 500 });
  }

  return Response.json({
    submission,
  });
}
