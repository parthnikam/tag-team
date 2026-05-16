import { redirect } from "next/navigation";
import AhCounterReportForm from "@/components/ahcounter-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/ahcounter">) {
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
    supabase.from("reports").select("ahcounter").eq("roomCode", id).maybeSingle(),
    supabase
      .from("room")
      .select("ahcounter, club_name, host_name")
      .eq("code", id)
      .maybeSingle(),
  ]);

  if (roomResult.error || !user || roomResult.data?.ahcounter !== user.id) {
    redirect(`/room/${id}`);
  }

  return (
    <main className="page-shell">
      <AhCounterReportForm
        code={id}
        initialSubmitted={Boolean(reportsResult.data?.ahcounter)}
        meetingName={roomResult.data.club_name ?? "Meeting"}
        hostName={roomResult.data.host_name ?? ""}
      />
    </main>
  );
}
