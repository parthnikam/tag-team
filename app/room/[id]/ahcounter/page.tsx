import AhCounterReportForm from "@/components/ahcounter-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/ahcounter">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("ahcounter")
    .eq("room_id", id)
    .maybeSingle();

  return (
    <main className="flex min-h-screen justify-center p-4">
      <AhCounterReportForm
        code={id}
        initialSubmitted={Boolean(data?.ahcounter)}
      />
    </main>
  );
}
