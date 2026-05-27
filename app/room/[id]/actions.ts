"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ROOM_ROLES, type RoomRole } from "@/lib/roles";
import { claimRoomRoleForUser } from "@/lib/claim-room-role";
import { createClient } from "@/utils/supabase/server";

export async function claimAndEnterRole(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const role = String(formData.get("role") ?? "");
  const participantName = String(formData.get("participantName") ?? "").trim();

  if (!code || !ROOM_ROLES.includes(role as RoomRole)) {
    redirect("/room");
  }

  const typedRole = role as RoomRole;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const claim = await claimRoomRoleForUser({
    supabase,
    code,
    role: typedRole,
    user,
    participantName,
  });

  if (claim.error || !claim.allowed) {
    redirect(`/room/${code}`);
  }

  revalidatePath(`/room/${code}`);
  revalidatePath(`/room/${code}/${typedRole}`);
  redirect(`/room/${code}/${typedRole}`);
}
