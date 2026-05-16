import { redirect } from "next/navigation";
import TimerReportForm from "@/components/timer-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/timer">) {
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
    supabase.from("reports").select("timer").eq("roomCode", id).maybeSingle(),
    supabase
      .from("room")
      .select("timer, club_name, host_name")
      .eq("code", id)
      .maybeSingle(),
  ]);

  if (roomResult.error || !user || roomResult.data?.timer !== user.id) {
    redirect(`/room/${id}`);
  }

  return (
    <main className="page-shell">
      <TimerReportForm
        code={id}
        initialSubmitted={Boolean(reportsResult.data?.timer)}
        meetingName={roomResult.data.club_name ?? "Meeting"}
        hostName={roomResult.data.host_name ?? ""}
      />
    </main>
  );
}
