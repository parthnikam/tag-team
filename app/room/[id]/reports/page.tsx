import Link from "next/link";
import BackLink from "@/components/back-link";
import RoomReportsView from "@/components/room-reports-view";

export default async function Page(props: PageProps<"/room/[id]/reports">) {
  const { id } = await props.params;

  return (
    <main className="page-shell">
      <div className="page-panel max-w-4xl">
        <BackLink href={`/room/${id}`} label="Back" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="page-kicker">Room</p>
            <h1 className="page-title mt-3">{id} reports</h1>
            <p className="page-copy mt-3">
              Submitted data for each room role appears here.
            </p>
          </div>

          <Link
            href={`/room/${id}`}
            className="surface-button-secondary"
          >
            Back to room
          </Link>
        </div>

        <RoomReportsView roomId={id} />
      </div>
    </main>
  );
}
