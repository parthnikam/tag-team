"use server";

import { createClient } from "@/utils/supabase/server";

const generateCode = async (supabase: any) => {
  while (true) {
    // generates number between 100000 and 999999
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase
      .from("room")
      .select("code")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // if no room exists with this code
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

    const code = await generateCode(supabase);
    console.log(`created room ${code} for user ${user.id}\n`);

    const { data, error } = await supabase
      .from("room")
      .insert([{ code: code, creator: user.id }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      room: data,
    });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
