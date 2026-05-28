"use client";

import Link from "next/link";
import { useEffect } from "react";
import { type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenText, Clock3, Mic } from "lucide-react";
import { claimAndEnterRole } from "@/app/room/[id]/actions";
import { ROOM_ROLES, ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";
import {
  setCachedParticipantName,
  setCachedRoomSession,
  useCachedParticipantName,
} from "@/components/room-session-cache";

type OccupiedRoles = Partial<Record<RoomRole, string | null>>;

const ROLE_META: Record<
  RoomRole,
  {
    description: string;
    icon: typeof Clock3;
  }
> = {
  timer: {
    description: "Track speech durations live",
    icon: Clock3,
  },
  ahcounter: {
    description: "Tap to tally filler words",
    icon: Mic,
  },
  grammarian: {
    description: "Note language usage",
    icon: BookOpenText,
  },
};

export default function RoomRolePicker({
  code,
  occupiedRoles,
  roleAssignments,
  currentUserId,
  currentUserName,
}: {
  code: string;
  occupiedRoles: OccupiedRoles;
  roleAssignments: OccupiedRoles;
  currentUserId: string | null;
  currentUserName: string;
}) {
  const router = useRouter();
  const participantName = useCachedParticipantName(code, currentUserName);

  useEffect(() => {
    router.prefetch(`/room/${code}/reports`);
    ROOM_ROLES.forEach((role) => {
      if (roleAssignments[role] === currentUserId) {
        router.prefetch(`/room/${code}/${role}`);
      }
    });
  }, [code, currentUserId, roleAssignments, router]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.04em] text-foreground">
          Choose your TAG role
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {ROOM_ROLES.map((role) => {
        const occupant = occupiedRoles[role] ?? null;
        const assignedUserId = roleAssignments[role] ?? null;
        const isTakenBySomeoneElse = Boolean(assignedUserId && assignedUserId !== currentUserId);
        const isTakenByCurrentUser = assignedUserId === currentUserId;
        const meta = ROLE_META[role];
        const Icon = meta.icon;
        const rolePath = `/room/${code}/${role}`;
        const className = `flex w-full items-center gap-4 rounded-[1.7rem] px-5 py-4 text-left ${
          isTakenBySomeoneElse
            ? "glass-role-card cursor-not-allowed opacity-40"
            : isTakenByCurrentUser
              ? "glass-role-card glass-role-card-selected"
              : "glass-role-card"
        }`;
        const content = (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4.5 w-4.5 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[1.4rem] font-semibold tracking-[-0.04em] text-foreground">
                {ROOM_ROLE_LABELS[role]}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {isTakenBySomeoneElse
                  ? `This role is already taken by ${occupant}`
                  : isTakenByCurrentUser
                    ? "Open your live role view"
                    : meta.description}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-foreground" />
          </>
        );

        if (isTakenByCurrentUser) {
          return (
            <Link
              key={role}
              href={rolePath}
              onPointerEnter={() => router.prefetch(rolePath)}
              onFocus={() => router.prefetch(rolePath)}
              className={className}
            >
              {content}
            </Link>
          );
        }

        return (
          <form
            key={role}
            action={claimAndEnterRole}
            onSubmit={() => {
              setCachedParticipantName(code, participantName);
              setCachedRoomSession({
                code,
                occupiedRoles: { [role]: participantName },
                roleAssignments: { [role]: currentUserId },
              });
            }}
          >
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="participantName" value={participantName} />
            <RoleButton
              className={className}
              disabled={isTakenBySomeoneElse}
            >
              {content}
            </RoleButton>
          </form>
        );
        })}
      </div>
    </div>
  );
}

function RoleButton({
  children,
  className,
  disabled,
}: {
  children: ReactNode;
  className: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={className}
    >
      {children}
    </button>
  );
}
