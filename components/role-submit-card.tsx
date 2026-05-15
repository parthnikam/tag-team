"use client";

import { useState, useTransition } from "react";
import { ROOM_ROLE_LABELS, type RoomRole } from "@/lib/roles";

export default function RoleSubmitCard({
  code,
  role,
  initialSubmitted,
}: {
  code: string;
  role: RoomRole;
  initialSubmitted: boolean;
}) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (submitted) {
      return;
    }

    setError("");

    startTransition(async () => {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not submit data.");
        return;
      }

      setSubmitted(true);
    });
  };

  return (
    <div className="w-full max-w-sm rounded border border-white/10 p-4">
      <p className="text-xs text-white/60">Room {code}</p>
      <h1 className="text-lg">{ROOM_ROLE_LABELS[role]}</h1>
      <p className="mt-1 text-sm text-white/60">Submit dummy JSON for this role.</p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitted || isPending}
        className="mt-4 w-full rounded border px-3 py-3 text-sm disabled:opacity-50"
      >
        {submitted ? "Already submitted" : isPending ? "Submitting..." : "Submit"}
      </button>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
