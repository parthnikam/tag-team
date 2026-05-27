import GrammarianReportForm from "@/components/grammarian-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/grammarian">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [reportsResult, roomResult] = await Promise.all([
    supabase.from("reports").select("grammarian").eq("roomCode", id).maybeSingle(),
    supabase.from("room").select("wod, meaning").eq("code", id).maybeSingle(),
  ]);

  const room = roomResult.data as { wod?: string | null; meaning?: string | null } | null;

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
