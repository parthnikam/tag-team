import TimerReportForm from "@/components/timer-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/timer">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const reportsResult = await supabase
    .from("reports")
    .select("timer")
    .eq("roomCode", id)
    .maybeSingle();

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
