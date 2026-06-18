"use client";

import { useEffect, useState, useRef } from "react";
import { Download, X, Clock3, Mic, BookOpenText } from "lucide-react";
import { type RoomRole } from "@/lib/roles";
import TimerReportDisplay from "@/components/timer-report-display";
import AhCounterReportDisplay from "@/components/ahcounter-report-display";
import GrammarianReportDisplay from "@/components/grammarian-report-display";
import {
  type AhCounterReportData,
  type GrammarianReportData,
  type TimerReportData,
} from "@/lib/report-data";
import {
  setCachedRoomSession,
  useCachedRoomSession,
} from "@/components/room-session-cache";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export type ReportPayload = {
  roomCode: string;
  role: RoomRole;
  submittedBy: string;
  name: string;
  submittedAt: string;
  data: unknown;
};

export type ReportItem = {
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
  initialReports,
  initialRoomInfo,
}: {
  roomCode: string;
  initialReports: ReportItem[];
  initialRoomInfo: {
    clubName?: string | null;
    hostName?: string | null;
  };
}) {
  const cachedRoom = useCachedRoomSession(roomCode);
  const [reports] = useState<ReportItem[]>(initialReports);
  const [selectedRole, setSelectedRole] = useState<RoomRole | null>(
    () => initialReports[0]?.role ?? null,
  );
  const [fetchedRoomInfo, setFetchedRoomInfo] = useState<{
    clubName?: string | null;
    hostName?: string | null;
  } | null>(initialRoomInfo);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const meetingName = cachedRoom?.clubName || fetchedRoomInfo?.clubName || roomCode;
  const hostName = cachedRoom?.hostName || fetchedRoomInfo?.hostName || "";

  useEffect(() => {
    if (
      cachedRoom?.clubName ||
      cachedRoom?.hostName ||
      !initialRoomInfo ||
      (!initialRoomInfo.clubName && !initialRoomInfo.hostName)
    ) {
      return;
    }

    setCachedRoomSession({
      code: roomCode,
      clubName: initialRoomInfo.clubName,
      hostName: initialRoomInfo.hostName,
    });
    setFetchedRoomInfo(initialRoomInfo);
  }, [cachedRoom?.clubName, cachedRoom?.hostName, initialRoomInfo, roomCode]);

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
        backgroundColor: null,
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

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="mt-6 mb-6 flex flex-col gap-6">
      {/* Header Section */}
      <div className="page-heading-inset flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
              meeting overview
            </p>
            <h1 className="mt-2 text-[2.5rem] font-semibold leading-tight tracking-[-0.05em] text-foreground">
              {meetingName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {submittedCount} of {totalCount} reports submitted
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {reports.map((report) => {
          const isSelected = selectedRole === report.role;
          const Icon = ROLE_ICONS[report.role];
          return (
            <button
              key={report.role}
              type="button"
              onClick={() => setSelectedRole(report.role)}
              className={`flex flex-col gap-2 rounded-[1rem] border-2 p-3 text-left transition-all sm:gap-3 sm:rounded-[1.7rem] sm:px-5 sm:py-6 ${
                isSelected
                  ? "border-primary bg-card"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                <Icon className="h-5 w-5 text-foreground sm:h-6 sm:w-6" />
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[0.55rem] font-semibold sm:px-2.5 sm:py-1 sm:text-xs ${
                    report.submitted
                      ? "bg-primary text-primary-foreground"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {report.submitted ? "READY" : "PENDING"}
                </span>
              </div>

              <div className="mt-1 sm:mt-0">
                <h3 className="text-[0.8rem] font-semibold leading-tight text-foreground sm:text-lg">
                  {report.label}
                </h3>
              </div>

              {report.submission && (
                <div className="w-full text-[0.6rem] text-muted-foreground sm:text-xs">
                  <p className="truncate font-medium">From {report.submission.name}</p>
                  <p className="mt-0.5 truncate sm:mt-1">
                    {new Date(report.submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Report Detail Section */}
      {selectedReport && (
        <section className="rounded-[1.7rem] border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {selectedReport.label} Report
            </h2>
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="text-muted-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {selectedReport.submission ? (
            <div className="mt-8">
              {selectedReport.role === "timer" && (
                <TimerReportDisplay
                  data={selectedReport.submission.data as TimerReportData}
                />
              )}
              {selectedReport.role === "ahcounter" && (
                <AhCounterReportDisplay
                  data={selectedReport.submission.data as AhCounterReportData}
                />
              )}
              {selectedReport.role === "grammarian" && (
                <GrammarianReportDisplay
                  data={selectedReport.submission.data as GrammarianReportData}
                />
              )}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              No report submitted yet.
            </p>
          )}
        </section>
      )}

      {/* Hidden Export Container */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div ref={pdfRef} className="w-[800px] bg-card p-8 flex flex-col gap-8">
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
              TAG Team Report
            </p>
            <h1 className="mt-2 text-[2.5rem] font-semibold leading-tight tracking-[-0.05em] text-foreground">
              {meetingName}
            </h1>
            <p className="mt-1 text-lg font-medium text-muted-foreground">
              Hosted by: {hostName}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          {reports.map((report) => (
            <section key={report.role} className="rounded-[1.7rem] border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  {report.label} Report
                </h2>
                {report.submission && (
                  <p className="text-sm text-muted-foreground">
                    By {report.submission.name}
                  </p>
                )}
              </div>
              
              {report.submission ? (
                <div className="mt-4">
                  {report.role === "timer" && (
                    <TimerReportDisplay data={report.submission.data as TimerReportData} />
                  )}
                  {report.role === "ahcounter" && (
                    <AhCounterReportDisplay data={report.submission.data as AhCounterReportData} />
                  )}
                  {report.role === "grammarian" && (
                    <GrammarianReportDisplay data={report.submission.data as GrammarianReportData} />
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
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
