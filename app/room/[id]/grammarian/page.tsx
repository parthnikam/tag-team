import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import GrammarianReportForm from "@/components/grammarian-report-form";
import { claimRoomRole } from "@/lib/claim-room-role";
import { participantNameCookie } from "@/lib/room-session-keys";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/grammarian">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    reportsResult,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reports").select("grammarian").eq("roomCode", id).maybeSingle(),
  ]);

  const cookieStore = await cookies();
  const encodedParticipantName = cookieStore.get(participantNameCookie(id))?.value;
  const participantName = encodedParticipantName
    ? decodeURIComponent(encodedParticipantName)
    : undefined;
  const claim = await claimRoomRole({
    supabase,
    code: id,
    role: "grammarian",
    user,
    participantName,
    extraSelect: "wod, meaning",
  });

  if (claim.error || !claim.allowed) {
    redirect(`/room/${id}`);
  }

  const room = claim.room as { wod?: string | null; meaning?: string | null } | null;

  return (
    <main className="page-shell">
      <GrammarianReportForm
        code={id}
        initialSubmitted={Boolean(reportsResult.data?.grammarian)}
        initialWod={room?.wod || ""}
        initialMeaning={room?.meaning || ""}
        meetingName="Meeting"
        hostName=""
      />
    </main>
  );
}
