import { type RoomRole } from "@/lib/roles";

const draftKey = (code: string, role: RoomRole) =>
  `toastmasters-report-draft:${code}:${role}`;

export const getRoleReportDraft = <TDraft,>(
  code: string,
  role: RoomRole,
): TDraft | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = window.sessionStorage.getItem(draftKey(code, role));

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as TDraft;
  } catch {
    window.sessionStorage.removeItem(draftKey(code, role));
    return null;
  }
};

export const setRoleReportDraft = <TDraft,>(
  code: string,
  role: RoomRole,
  draft: TDraft,
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(draftKey(code, role), JSON.stringify(draft));
};

export const clearRoleReportDraft = (code: string, role: RoomRole) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(draftKey(code, role));
};
