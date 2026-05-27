import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AhCounterReportForm from "@/components/ahcounter-report-form";
import { claimRoomRole } from "@/lib/claim-room-role";
import { participantNameCookie } from "@/lib/room-session-keys";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/ahcounter">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    reportsResult,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reports").select("ahcounter").eq("roomCode", id).maybeSingle(),
  ]);

  const cookieStore = await cookies();
  const encodedParticipantName = cookieStore.get(participantNameCookie(id))?.value;
  const participantName = encodedParticipantName
    ? decodeURIComponent(encodedParticipantName)
    : undefined;
  const claim = await claimRoomRole({
    supabase,
    code: id,
    role: "ahcounter",
    user,
    participantName,
  });

  if (claim.error || !claim.allowed) {
    redirect(`/room/${id}`);
  }

  return (
    <main className="page-shell">
      <AhCounterReportForm
        code={id}
        initialSubmitted={Boolean(reportsResult.data?.ahcounter)}
        meetingName="Meeting"
        hostName=""
      />
    </main>
  );
}
