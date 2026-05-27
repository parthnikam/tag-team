import { createClient } from "@/utils/supabase/server";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/roominfo/[id]">,
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

  const { data: room, error } = await supabase
    .from("room")
    .select("code, club_name, host_name")
    .eq("code", id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!room) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  return Response.json({
    room: {
      code: room.code,
      clubName: room.club_name,
      hostName: room.host_name,
    },
  });
}
