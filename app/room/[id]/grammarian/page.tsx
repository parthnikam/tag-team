import GrammarianReportForm from "@/components/grammarian-report-form";
import { createClient } from "@/utils/supabase/server";

export default async function Page(props: PageProps<"/room/[id]/grammarian">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("grammarian")
    .eq("room_id", id)
    .maybeSingle();

  return (
    <main className="flex min-h-screen justify-center p-4">
      <GrammarianReportForm
        code={id}
        initialSubmitted={Boolean(data?.grammarian)}
      />
    </main>
  );
}
