import AhCounterReportForm from "@/components/ahcounter-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/ahcounter">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const reportsResult = await supabase
    .from("reports")
    .select("ahcounter")
    .eq("roomCode", id)
    .maybeSingle();

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
