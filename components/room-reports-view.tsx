"use client";

import { useEffect, useState } from "react";
import { type RoomRole } from "@/lib/roles";

type ReportPayload = {
  roomCode: string;
  role: RoomRole;
  submittedBy: string;
  submittedAt: string;
  data: unknown;
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
    return <p className="text-sm text-[#6B6B6B]">Loading reports...</p>;
  }

  if (error) {
    return <p className="text-sm text-[#B42318]">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reports.map((report) => (
        <section
          key={report.role}
          className="surface-card"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#0A0A0A]">{report.label}</h2>
            <span className="rounded-full border border-[#EAEAEA] px-3 py-1 text-xs font-medium text-[#6B6B6B]">
              {report.submitted ? "Submitted" : "Pending"}
            </span>
          </div>

          {report.submission ? (
            <div className="mt-3 flex flex-col gap-3">
              <p className="text-sm text-[#6B6B6B]">
                Submitted at {new Date(report.submission.submittedAt).toLocaleString()}
              </p>
              <pre className="overflow-x-auto rounded-3xl border border-[#EAEAEA] bg-[#FCFCFC] p-5 text-xs leading-6 text-[#333333]">
                {JSON.stringify(report.submission, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#6B6B6B]">No report submitted yet.</p>
          )}
        </section>
      ))}
    </div>
  );
}
