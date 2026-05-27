import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TimerReportForm from "@/components/timer-report-form";
import { claimRoomRole } from "@/lib/claim-room-role";
import { participantNameCookie } from "@/lib/room-session-keys";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/timer">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    reportsResult,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reports").select("timer").eq("roomCode", id).maybeSingle(),
  ]);

  const cookieStore = await cookies();
  const encodedParticipantName = cookieStore.get(participantNameCookie(id))?.value;
  const participantName = encodedParticipantName
    ? decodeURIComponent(encodedParticipantName)
    : undefined;
  const claim = await claimRoomRole({
    supabase,
    code: id,
    role: "timer",
    user,
    participantName,
  });

  if (claim.error || !claim.allowed) {
    redirect(`/room/${id}`);
  }

  return (
    <main className="page-shell">
      <TimerReportForm
        code={id}
        initialSubmitted={Boolean(reportsResult.data?.timer)}
        meetingName="Meeting"
        hostName=""
      />
    </main>
  );
}
