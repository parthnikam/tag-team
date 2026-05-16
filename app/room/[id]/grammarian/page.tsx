import { redirect } from "next/navigation";
import GrammarianReportForm from "@/components/grammarian-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/grammarian">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    reportsResult,
    roomResult,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("reports").select("grammarian").eq("roomCode", id).maybeSingle(),
    supabase.from("room").select("grammarian, wod, meaning, club_name, host_name").eq("code", id).maybeSingle(),
  ]);

  if (roomResult.error || !user || roomResult.data?.grammarian !== user.id) {
    redirect(`/room/${id}`);
  }

  return (
    <main className="page-shell">
      <GrammarianReportForm
        code={id}
        initialSubmitted={Boolean(reportsResult.data?.grammarian)}
        initialWod={roomResult.data?.wod || ""}
        initialMeaning={roomResult.data?.meaning || ""}
        meetingName={roomResult.data?.club_name || "Meeting"}
        hostName={roomResult.data?.host_name || ""}
      />
    </main>
  );
}
