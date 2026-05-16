import BackLink from "@/components/back-link";
import RoomReportsView from "@/components/room-reports-view";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/reports">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("room")
    .select("club_name, host_name")
    .eq("code", id)
    .maybeSingle();

  const meetingName = room?.club_name || id;
  const hostName = room?.host_name || "";

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <BackLink href={`/room/${id}`} label="Back" />

        <RoomReportsView 
          roomCode={id} 
          meetingName={meetingName}
          hostName={hostName}
        />
      </div>
    </main>
  );
}
