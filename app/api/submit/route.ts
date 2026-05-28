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
  const typedRoleNameColumn = `${typedRole}_name`;

  const [roomResult, existingResult] = await Promise.all([
    supabase
      .from("room")
      .select("timer, grammarian, ahcounter, timer_name, grammarian_name, ahcounter_name")
      .eq("code", code)
      .maybeSingle(),
    supabase
      .from("reports")
      .select(`roomCode, ${typedRole}`)
      .eq("roomCode", code)
      .maybeSingle(),
  ]);

  if (roomResult.error) {
    return Response.json({ error: roomResult.error.message }, { status: 500 });
  }

  if (!roomResult.data) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  const room = roomResult.data as unknown as Record<string, string | null>;

  if (room[typedRole] !== user.id) {
    return Response.json(
      { error: "You are not assigned to this role" },
      { status: 403 },
    );
  }

  if (existingResult.error) {
    return Response.json({ error: existingResult.error.message }, { status: 500 });
  }

  if (existingResult.data && existingResult.data[typedRole as keyof typeof existingResult.data]) {
    return Response.json(
      { error: "This role has already submitted data" },
      { status: 409 },
    );
  }

  const roletakerName =
    room[typedRoleNameColumn]?.trim() ||
    user.user_metadata?.full_name ||
    "Participant";
  const payload = buildSubmissionPayload(code, typedRole, user.id, reportData, roletakerName);

  const { error: upsertError } = await supabase
    .from("reports")
    .upsert({ roomCode: code, [typedRole]: payload }, { onConflict: "roomCode" });

  if (upsertError) {
    return Response.json({ error: upsertError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
