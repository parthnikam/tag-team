"use client";

import { useEffect, useState, useRef } from "react";
import { Download, X, Clock3, Mic, BookOpenText } from "lucide-react";
import { type RoomRole } from "@/lib/roles";
import TimerReportDisplay from "@/components/timer-report-display";
import AhCounterReportDisplay from "@/components/ahcounter-report-display";
import GrammarianReportDisplay from "@/components/grammarian-report-display";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type ReportPayload = {
  roomCode: string;
  role: RoomRole;
  submittedBy: string;
  name: string;
  submittedAt: string;
  data: unknown;
};

type ReportItem = {
  role: RoomRole;
  label: string;
  submitted: boolean;
  submission: ReportPayload | null;
};

const ROLE_ICONS: Record<RoomRole, typeof Clock3> = {
  timer: Clock3,
  ahcounter: Mic,
  grammarian: BookOpenText,
};

export default function RoomReportsView({
  roomCode,
  meetingName,
  hostName,
}: {
  roomCode: string;
  meetingName: string;
  hostName: string;
}) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoomRole | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        const response = await fetch(`/api/getreports/${roomCode}`);
        const data = (await response.json()) as {
          error?: string;
          reports?: ReportItem[];
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load reports.");
        }

        if (isMounted) {
          setReports(data.reports ?? []);
          if (data.reports && data.reports.length > 0) {
            setSelectedRole(data.reports[0].role);
          }
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
  }, [roomCode]);

  const selectedReport = reports.find((r) => r.role === selectedRole);
  const submittedCount = reports.filter((r) => r.submitted).length;
  const totalCount = reports.length;

  const handleExportPdf = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);

    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`toastmasters-report-${roomCode}.pdf`);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-[#6B6B6B]">Loading reports...</p>;
  }

  if (error) {
    return <p className="text-sm text-[#B42318]">{error}</p>;
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
              meeting overview
            </p>
            <h1 className="mt-2 text-[2.5rem] font-semibold leading-tight tracking-[-0.05em] text-[#0A0A0A]">
              {meetingName}
            </h1>
            <p className="mt-2 text-sm text-[#667085]">
              {submittedCount} of {totalCount} reports submitted
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] px-5 py-3 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {reports.map((report) => {
          const isSelected = selectedRole === report.role;
          const Icon = ROLE_ICONS[report.role];
          return (
            <button
              key={report.role}
              type="button"
              onClick={() => setSelectedRole(report.role)}
              className={`flex flex-col gap-3 rounded-[1.7rem] border-2 px-5 py-6 text-left transition-all ${
                isSelected
                  ? "border-[#0A0A0A] bg-white"
                  : "border-[#EAEAEA] bg-white hover:border-[#CCCCCC]"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-[#0A0A0A]" />
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    report.submitted
                      ? "bg-[#0A0A0A] text-white"
                      : "bg-[#FFE5D9] text-[#B42318]"
                  }`}
                >
                  {report.submitted ? "READY" : "PENDING"}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#0A0A0A]">
                  {report.label}
                </h3>
              </div>

              {report.submission && (
                <div className="text-xs text-[#667085]">
                  <p className="font-medium">From {report.submission.name}</p>
                  <p className="mt-1">
                    {new Date(report.submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Report Detail Section */}
      {selectedReport && (
        <section className="rounded-[1.7rem] border border-[#EAEAEA] bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-[#0A0A0A]">
              {selectedReport.label} Report
            </h2>
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="text-[#667085] hover:text-[#0A0A0A]"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {selectedReport.submission ? (
            <div className="mt-8">
              {selectedReport.role === "timer" && (
                <TimerReportDisplay
                  data={selectedReport.submission.data as any}
                />
              )}
              {selectedReport.role === "ahcounter" && (
                <AhCounterReportDisplay
                  data={selectedReport.submission.data as any}
                />
              )}
              {selectedReport.role === "grammarian" && (
                <GrammarianReportDisplay
                  data={selectedReport.submission.data as any}
                />
              )}
            </div>
          ) : (
            <p className="mt-8 text-sm text-[#6B6B6B]">
              No report submitted yet.
            </p>
          )}
        </section>
      )}

      {/* Hidden Export Container */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div ref={pdfRef} className="w-[800px] bg-white p-8 flex flex-col gap-8">
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
              TAG Team Report
            </p>
            <h1 className="mt-2 text-[2.5rem] font-semibold leading-tight tracking-[-0.05em] text-[#0A0A0A]">
              {meetingName}
            </h1>
            <p className="mt-1 text-lg font-medium text-[#475467]">
              Hosted by: {hostName}
            </p>
            <p className="mt-2 text-sm text-[#667085]">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          {reports.map((report) => (
            <section key={report.role} className="rounded-[1.7rem] border border-[#EAEAEA] bg-white p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-[#0A0A0A]">
                  {report.label} Report
                </h2>
                {report.submission && (
                  <p className="text-sm text-[#667085]">
                    By {report.submission.name}
                  </p>
                )}
              </div>
              
              {report.submission ? (
                <div className="mt-4">
                  {report.role === "timer" && (
                    <TimerReportDisplay data={report.submission.data as any} />
                  )}
                  {report.role === "ahcounter" && (
                    <AhCounterReportDisplay data={report.submission.data as any} />
                  )}
                  {report.role === "grammarian" && (
                    <GrammarianReportDisplay data={report.submission.data as any} />
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#6B6B6B]">
                  No report submitted for this role.
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
