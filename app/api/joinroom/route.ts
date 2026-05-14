'use server'

import { createClient } from "@/utils/supabase/server"


type JoinRequest = {
    code: string;
    role: string;
}

export default async function POST(req: Request) {
    const supabase = await createClient();

    const {data: {user}, error: authError} = await supabase.auth.getUser();

    const {code, role} = await req.json();

    if (authError || !user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }


    // validate role
    const allowedRoles = [
        "timer",
        "grammarian",
        "ahcounter",
    ];

    if (!allowedRoles.includes(role)) {
        return Response.json(
            { error: "Invalid role" },
            { status: 400 }
        );
    }


    const {data, error} = await supabase
    .from("room")
    .update({[role]: user.id})
    .eq("code", code)
    .select()
    .single();

    if (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return Response.json({
        room: data,
    });
}