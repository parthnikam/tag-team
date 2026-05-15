import TimerReportForm from "@/components/timer-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/timer">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("timer")
    .eq("room_id", id)
    .maybeSingle();

  return (
    <main className="flex min-h-screen justify-center p-4">
      <TimerReportForm code={id} initialSubmitted={Boolean(data?.timer)} />
    </main>
  );
}
