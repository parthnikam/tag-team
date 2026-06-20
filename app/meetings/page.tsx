import BackLink from "@/components/back-link";
import { ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type RoleHistoryRow = {
  id: string | number;
  roomCode: string;
  role: "host" | RoomRole;
  userName: string | null;
  created_at: string;
  room:
    | {
        club_name: string | null;
        host_name: string | null;
        created_at: string | null;
      }
    | Array<{
        club_name: string | null;
        host_name: string | null;
        created_at: string | null;
      }>
    | null;
};

type MeetingHistory = {
  roomCode: string;
  clubName: string;
  hostName: string;
  joinedAt: string;
  roles: Array<"host" | RoomRole>;
};

const roleLabel = (role: "host" | RoomRole) =>
  role === "host" ? "Host" : ROOM_ROLE_LABELS[role];

const formatMeetingDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
        host_name,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meetings:", error);
  }

  const meetingMap = new Map<string, MeetingHistory>();

  for (const entry of (roleHistory ?? []) as RoleHistoryRow[]) {
    const room = Array.isArray(entry.room) ? entry.room[0] : entry.room;
    const existingMeeting = meetingMap.get(entry.roomCode);

    if (existingMeeting) {
      if (!existingMeeting.roles.includes(entry.role)) {
        existingMeeting.roles.push(entry.role);
      }

      continue;
    }

    meetingMap.set(entry.roomCode, {
      roomCode: entry.roomCode,
      clubName: room?.club_name || "Toastmasters Meeting",
      hostName: room?.host_name || "",
      joinedAt: room?.created_at || entry.created_at,
      roles: [entry.role],
    });
  }

  const meetings = Array.from(meetingMap.values());

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-4xl pb-8 sm:pb-10">
        <BackLink href="/room" label="Home" />

        <div className="page-heading-inset mt-9">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted-foreground">
            History
          </p>
          <h1 className="mt-2 text-[3.15rem] font-semibold leading-none tracking-[-0.07em] text-foreground sm:text-[4.1rem]">
            Your meetings
          </h1>
          <p className="mt-4 text-[1rem] leading-7 text-muted-foreground">
            Every meeting you&apos;ve hosted or joined.
          </p>
        </div>

        <section className="mt-10 flex flex-col gap-3.5 sm:gap-4">
          {meetings.length === 0 ? (
            <div className="glass-flat-card rounded-[2rem] px-8 py-10 text-center text-muted-foreground">
              You haven&apos;t participated in any meetings yet.
            </div>
          ) : (
            meetings.map((meeting) => (
                <Link
                  key={meeting.roomCode}
                  href={`/room/${meeting.roomCode}/reports?from=meetings`}
                  className="glass-flat-card flex items-center gap-4 rounded-[2rem] px-5 py-5 text-foreground sm:gap-6 sm:px-8 sm:py-7"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-[1.45rem]">
                        {meeting.clubName}
                      </h2>
                      {meeting.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase leading-none tracking-[0.12em] text-primary-foreground bg-foreground"
                        >
                          {roleLabel(role)}
                        </span>
                      ))}
                    </div>

                    <p className="mt-1.5 truncate text-sm font-medium tracking-[0.04em] text-muted-foreground sm:text-base">
                      CODE {meeting.roomCode} <span className="tracking-normal">·</span>{" "}
                      {formatMeetingDate(meeting.joinedAt)}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))
          )}
        </section>
      </div>
    </main>
  );
}
