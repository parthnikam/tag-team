import BackLink from "@/components/back-link";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MeetingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch from roletakers and join with room to get meeting details
  const { data: roleHistory, error } = await supabase
    .from("roletakers")
    .select(`
      id,
      roomCode,
      role,
      userName,
      created_at,
      room:roomCode (
        club_name,
        meeting_number,
        host_name,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meetings:", error);
  }

  // Fallback to roletakers if join fails
  const meetings = roleHistory || [];

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <BackLink href="/room" label="Back to Lobby" />

        <div className="mt-5">
          <h1 className="text-[2.45rem] font-semibold tracking-[-0.06em] text-[#0A0A0A]">
            My Meetings
          </h1>
          <p className="mt-2 text-[1rem] leading-7 text-[#667085]">
            A history of meetings you've hosted or participated in.
          </p>
        </div>

        <section className="mt-8 flex flex-col gap-4">
          {meetings.length === 0 ? (
            <div className="rounded-3xl border border-[#EAEAEA] bg-white p-8 text-center text-[#667085]">
              You haven't participated in any meetings yet.
            </div>
          ) : (
            meetings.map((meeting) => {
              const room = Array.isArray(meeting.room) ? meeting.room[0] : meeting.room;
              
              return (
                <div
                  key={meeting.id}
                  className="rounded-[1.5rem] border border-[#EAEAEA] bg-white p-5 transition-colors hover:border-[#CCCCCC]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </p>
                      <h2 className="mt-1.5 text-xl font-semibold text-[#0A0A0A]">
                        {room?.club_name || "Toastmasters Meeting"}
                      </h2>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="rounded-full bg-[#F3F3F3] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]">
                          {meeting.role === 'host' ? 'Host' : meeting.role}
                        </span>
                        <span className="text-sm text-[#667085]">
                          Code: {meeting.roomCode}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/room/${meeting.roomCode}`}
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-[#EAEAEA] bg-white px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7] sm:mt-0"
                    >
                      View Meeting
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
