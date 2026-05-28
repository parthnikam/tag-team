import BackLink from "@/components/back-link";
import RoomReportsView, { type ReportPayload } from "@/components/room-reports-view";
import { ROOM_ROLES, ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function Page(props: PageProps<"/room/[id]/reports">) {
  const [{ id }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const source = Array.isArray(searchParams.from)
    ? searchParams.from[0]
    : searchParams.from;
  const backHref = source === "meetings" ? "/meetings" : `/room/${id}`;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const [reportsResult, roomResult] = await Promise.all([
    supabase
      .from("reports")
      .select(`roomCode, ${ROOM_ROLES.join(", ")}`)
      .eq("roomCode", id)
      .maybeSingle(),
    supabase
      .from("room")
      .select("code, club_name, host_name")
      .eq("code", id)
      .maybeSingle(),
  ]);

  if (reportsResult.error) {
    throw new Error(reportsResult.error.message);
  }

  if (roomResult.error) {
    throw new Error(roomResult.error.message);
  }

  if (!roomResult.data || !reportsResult.data) {
    notFound();
  }

  const reportRow = reportsResult.data as unknown as { roomCode: string } & Record<
    RoomRole,
    ReportPayload | null
  >;
  const reports = ROOM_ROLES.map((role) => {
    const submission = reportRow[role];

    return {
      role,
      label: ROOM_ROLE_LABELS[role],
      submitted: Boolean(submission),
      submission,
    };
  });

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <BackLink href={backHref} label="Back" />

        <RoomReportsView
          roomCode={id}
          initialReports={reports}
          initialRoomInfo={{
            clubName: roomResult.data.club_name,
            hostName: roomResult.data.host_name,
          }}
        />
      </div>
    </main>
  );
}
