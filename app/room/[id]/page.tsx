import { notFound } from "next/navigation";
import RoomRolePicker from "@/components/room-role-picker";
import { ROOM_ROLES } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{data: { user },},roomResult,] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("room")
      .select(`code, ${ROOM_ROLES.join(", ")}`)
      .eq("code", id)
      .maybeSingle(),
  ]);

  if (roomResult.error) {
    throw new Error(roomResult.error.message);
  }

  if (!roomResult.data) {
    notFound();
  }

  const occupiedRoles = ROOM_ROLES.reduce(
    (result, role) => {
      result[role] = roomResult.data?.[role] ?? null;
      return result;
    },
    {} as Record<(typeof ROOM_ROLES)[number], string | null>,
  );

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded border border-white/10 p-4">
        <div>
          <p className="text-xs text-white/60">Room</p>
          <h1 className="text-lg">{id}</h1>
          <p className="text-sm text-white/60">
            Pick an available role to join.
          </p>
        </div>

        <RoomRolePicker
          code={id}
          occupiedRoles={occupiedRoles}
          currentUserId={user?.id ?? null}
        />
      </div>
    </main>
  );
}
