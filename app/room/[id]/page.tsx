import Link from "next/link";
import { notFound } from "next/navigation";
import RoomRolePicker from "@/components/room-role-picker";
import RoomShareActions from "@/components/room-share-actions";
import BackLink from "@/components/back-link";
import { FileText } from "lucide-react";
import { ROOM_ROLES } from "@/lib/roles";
import RoomJoinedNameField from "@/components/room-joined-name-field";
import { RoomSessionSeed } from "@/components/room-session-cache";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{data: { user },},roomResult,] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("room")
      .select(
        "code, host_name, club_name, timer, ahcounter, grammarian, timer_name, ahcounter_name, grammarian_name",
      )
      .eq("code", id)
      .maybeSingle(),
  ]);

  if (roomResult.error) {
    throw new Error(roomResult.error.message);
  }

  if (!roomResult.data) {
    notFound();
  }

  const room = roomResult.data as Record<string, string | number | null>;

  const occupiedRoles = ROOM_ROLES.reduce(
    (result, role) => {
      result[role] = (room[`${role}_name`] as string | null) ?? null;
      return result;
    },
    {} as Record<(typeof ROOM_ROLES)[number], string | null>,
  );

  const roleAssignments = ROOM_ROLES.reduce(
    (result, role) => {
      result[role] = (room[role] as string | null) ?? null;
      return result;
    },
    {} as Record<(typeof ROOM_ROLES)[number], string | null>,
  );
  const currentUserRole =
    ROOM_ROLES.find((role) => roleAssignments[role] === user?.id) ?? null;
  const joinedAsName =
    (currentUserRole ? occupiedRoles[currentUserRole] : null) ||
    user?.user_metadata?.full_name ||
    "";

  return (
    <main className="page-shell" data-bg-word="MEETING">
      <RoomSessionSeed
        room={{
          code: roomResult.data.code,
          clubName: roomResult.data.club_name,
          hostName: roomResult.data.host_name,
          occupiedRoles,
          roleAssignments,
        }}
      />
      <div className="mx-auto max-w-3xl">
        <BackLink href="/room" label="Back" />

        <div className="border rounded-[1.85rem] p-6 mt-3">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
                Meeting lobby
              </p>
              <h1 className="mt-2 text-[3rem] font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-[3.5rem]">
                {roomResult.data.club_name}
              </h1>
              <p className="mt-2 text-[1rem] text-muted-foreground">
                Hosted by {roomResult.data.host_name}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
                  Code
                </p>
                <p className="mt-1 text-[1.85rem] font-semibold leading-none tracking-[0.18em] text-foreground sm:text-[2.2rem]">
                  {roomResult.data.code}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <RoomShareActions
                  code={roomResult.data.code}
                />
              </div>
            </div>
          </div>

          <RoomJoinedNameField
            code={id}
            initialName={joinedAsName}
            currentRole={currentUserRole}
          />
        </div>

        <div className="mt-4">
          <RoomRolePicker
            code={id}
            occupiedRoles={occupiedRoles}
            roleAssignments={roleAssignments}
            currentUserId={user?.id ?? null}
            currentUserName={user?.user_metadata?.full_name ?? ""}
          />
        </div>

        <section className="mt-3 border rounded-[1.85rem] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground">
                Meeting Overview
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Watch reports come in live.
              </p>
            </div>

            <Link
              href={`/room/${id}/reports`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors"
            >
              <FileText className="h-4 w-4" />
              Open host view
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
