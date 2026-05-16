"use server";

import { ROOM_ROLES, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const generateCode = async (supabase: SupabaseClient) => {
  while (true) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase
      .from("room")
      .select("code")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return code;
    }
  }
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      hostName?: string;
      clubName?: string;
      joinAs?: "host" | RoomRole;
    };

    const hostName = body.hostName?.trim();
    const clubName = body.clubName?.trim() || "Toastmasters meeting";
    const joinAs = body.joinAs;

    if (!hostName) {
      return Response.json({ error: "Missing meeting details." }, { status: 400 });
    }

    if (joinAs && joinAs !== "host" && !ROOM_ROLES.includes(joinAs)) {
      return Response.json({ error: "Invalid meeting role." }, { status: 400 });
    }

    const code = await generateCode(supabase);

    const roomInsert: Record<string, string | number> = {
      code,
      creator: user.id,
      host_name: hostName,
      club_name: clubName,
    };

    if (joinAs && joinAs !== "host") {
      roomInsert[joinAs] = user.id;
      roomInsert[`${joinAs}_name`] = hostName;
    }

    const { data: room, error: roomError } = await supabase
      .from("room")
      .insert([roomInsert])
      .select()
      .single();

    if (roomError) {
      return Response.json({ error: roomError.message }, { status: 500 });
    }

    const { error: reportError } = await supabase
      .from("reports")
      .insert([{ roomCode: code }]);

    if (reportError) {
      return Response.json({ error: reportError.message }, { status: 500 });
    }

    // const roletakersInserts = [
    //   {
    //     roomCode: code,
    //     user_id: user.id,
    //     role: "host",
    //     userName: hostName,
    //   }
    // ];

    // if (joinAs && joinAs !== "host") {
    //   roletakersInserts.push({
    //     roomCode: code,
    //     user_id: user.id,
    //     role: joinAs,
    //     userName: hostName,
    //   });
    // }

    // const { error: roletakersError } = await supabase
    //   .from("roletakers")
    //   .insert(roletakersInserts);

    // if (roletakersError) {
    //   console.error("Failed to insert into roletakers:", roletakersError);
    // }

    return Response.json({
      room,
    });
  } catch {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
