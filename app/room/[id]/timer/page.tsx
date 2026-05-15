import RoleSubmitCard from "@/components/role-submit-card";
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
    <main className="flex min-h-screen items-center justify-center p-4">
      <RoleSubmitCard code={id} role="timer" initialSubmitted={Boolean(data?.timer)} />
    </main>
  );
}
