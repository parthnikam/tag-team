import { ROOM_ROLES, ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

type ReportPayload = {
  roomCode: string;
  role: RoomRole;
  submittedBy: string;
  submittedAt: string;
  data: unknown;
};

export async function GET(
  _request: Request,
  context: RouteContext<"/api/getreports/[id]">,
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("reports")
    .select(`roomCode, ${ROOM_ROLES.join(", ")}`)
    .eq("roomCode", id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: "Reports not found" }, { status: 404 });
  }

  const typedData = data as unknown as { roomCode: string } & Record<RoomRole, ReportPayload | null>;

  const reports = ROOM_ROLES.map((role: RoomRole) => {
    const submission = typedData[role];

    return {
      role,
      label: ROOM_ROLE_LABELS[role],
      submitted: Boolean(submission),
      submission,
    };
  });

  return Response.json({
    roomCode: typedData.roomCode,
    reports,
  });
}
