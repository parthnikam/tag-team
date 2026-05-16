import Link from "next/link";
import { notFound } from "next/navigation";
import RoomRolePicker from "@/components/room-role-picker";
import RoomShareActions from "@/components/room-share-actions";
import BackLink from "@/components/back-link";
import { FileText } from "lucide-react";
import { ROOM_ROLES } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{data: { user },},roomResult,] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("room")
      .select("*")
      // .select(`code, host_name, club_name, meeting_number, ${ROOM_ROLES.join(", ")}`)
      .eq("code", id)
      .maybeSingle(),
  ]);

  if (roomResult.error) {
    throw new Error(roomResult.error.message);
  }

  if (!roomResult.data) {
    notFound();
  }
  console.log(roomResult?.data);
  const occupiedRoles = ROOM_ROLES.reduce(
    (result, role) => {
      result[role] = roomResult.data?.[role+"_name"] ?? null;
      return result;
    },
    {} as Record<(typeof ROOM_ROLES)[number], string | null>,
  );

  const roleAssignments = ROOM_ROLES.reduce(
    (result, role) => {
      result[role] = roomResult.data?.[role] ?? null;
      return result;
    },
    {} as Record<(typeof ROOM_ROLES)[number], string | null>,
  );

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <BackLink href="/room" label="Back" />

        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
            Meeting {roomResult.data.meeting_number}
          </p>
          <h1 className="mt-2 text-[3rem] font-semibold leading-[0.98] tracking-[-0.07em] text-[#0A0A0A] sm:text-[3.5rem]">
            {roomResult.data.club_name}
          </h1>
          <p className="mt-2 text-[1rem] text-[#667085]">
            Hosted by {roomResult.data.host_name}
          </p>
        </div>

        <section className="mt-6 rounded-[1.85rem] border border-[#E7E7E7] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
                Code
              </p>
              <p className="mt-2 text-[2.7rem] font-semibold tracking-[0.22em] text-[#0A0A0A] sm:text-[3.1rem]">
                {roomResult.data.code}
              </p>
            </div>

            <RoomShareActions
              code={roomResult.data.code}
              roomPath={`/room/${roomResult.data.code}`}
            />
          </div>
        </section>

        <div className="mt-6">
          <RoomRolePicker
            code={id}
            occupiedRoles={occupiedRoles}
            roleAssignments={roleAssignments}
            currentUserId={user?.id ?? null}
            currentUserName={user?.user_metadata?.full_name ?? ""}
          />
        </div>

        <section className="mt-6 rounded-[1.85rem] border border-[#E7E7E7] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[#0A0A0A]">
                Meeting Overview
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                Watch reports come in live.
              </p>
            </div>

            <Link
              href={`/room/${id}/reports`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] px-5 py-3 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7]"
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
