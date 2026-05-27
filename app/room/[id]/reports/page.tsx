import BackLink from "@/components/back-link";
import RoomReportsView from "@/components/room-reports-view";

export default async function Page(props: PageProps<"/room/[id]/reports">) {
  const { id } = await props.params;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl">
        <BackLink href={`/room/${id}`} label="Back" />

        <RoomReportsView roomCode={id} />
      </div>
    </main>
  );
}
