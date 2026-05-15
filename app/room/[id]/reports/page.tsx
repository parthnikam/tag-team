import Link from "next/link";
import RoomReportsView from "@/components/room-reports-view";

export default async function Page(props: PageProps<"/room/[id]/reports">) {
  const { id } = await props.params;

  return (
    <main className="flex min-h-screen justify-center p-4">
      <div className="flex w-full max-w-3xl flex-col gap-4 rounded border border-white/10 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-white/60">Room</p>
            <h1 className="text-lg">{id} reports</h1>
            <p className="text-sm text-white/60">
              Submitted data for each room role appears here.
            </p>
          </div>

          <Link
            href={`/room/${id}`}
            className="rounded border border-white/20 px-3 py-2 text-sm"
          >
            Back to room
          </Link>
        </div>

        <RoomReportsView roomId={id} />
      </div>
    </main>
  );
}
