"use client";

import { useEffect, useState } from "react";
import { type RoomRole } from "@/lib/roles";

type ReportPayload = {
  roomCode: string;
  role: RoomRole;
  submittedBy: string;
  submittedAt: string;
  entries: Array<{
    label: string;
    value: string;
  }>;
};

type ReportItem = {
  role: RoomRole;
  label: string;
  submitted: boolean;
  submission: ReportPayload | null;
};

export default function RoomReportsView({ roomId }: { roomId: string }) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        const response = await fetch(`/api/getreports/${roomId}`);
        const data = (await response.json()) as {
          error?: string;
          reports?: ReportItem[];
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load reports.");
        }

        if (isMounted) {
          setReports(data.reports ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not load reports.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  if (isLoading) {
    return <p className="text-sm text-white/60">Loading reports...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => (
        <section
          key={report.role}
          className="rounded border border-white/10 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base">{report.label}</h2>
            <span className="text-xs text-white/60">
              {report.submitted ? "Submitted" : "Pending"}
            </span>
          </div>

          {report.submission ? (
            <div className="mt-3 flex flex-col gap-3">
              <p className="text-xs text-white/60">
                Submitted at {new Date(report.submission.submittedAt).toLocaleString()}
              </p>
              <pre className="overflow-x-auto rounded bg-white/5 p-3 text-xs text-white/80">
                {JSON.stringify(report.submission, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/60">No report submitted yet.</p>
          )}
        </section>
      ))}
    </div>
  );
}
