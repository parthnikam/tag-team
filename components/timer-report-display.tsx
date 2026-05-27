import { type TimerReportData, type TimerPerson } from "@/lib/report-data";

const formatSeconds = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface TimerReportDisplayProps {
  data: TimerReportData;
}

interface Section {
  title: string;
  people: TimerPerson[];
}

export default function TimerReportDisplay({ data }: TimerReportDisplayProps) {
  const sections: Section[] = [
    { title: "TABLE TOPICS", people: data.tabletopics || [] },
    { title: "PREPARED SPEECHES", people: data.speeches || [] },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
            {section.title}
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <tbody>
                {section.people.map((person, index) => (
                  <tr
                    key={index}
                    className={`border-t border-border ${
                      index === 0 ? "" : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-foreground">{person.name}</td>
                    <td className="px-5 py-4 text-right text-foreground font-medium">
                      {formatSeconds(person.time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
