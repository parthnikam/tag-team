import { type AhCounterReportData } from "@/lib/report-data";

const COUNT_FIELDS: Array<{
  key: keyof Omit<
    AhCounterReportData["people"][0],
    "name"
  >;
  label: string;
}> = [
  { key: "ah", label: "AH" },
  { key: "um", label: "UM" },
  { key: "er", label: "ER" },
  { key: "well", label: "WELL" },
  { key: "so", label: "SO" },
  { key: "like", label: "LIKE" },
  { key: "but", label: "BUT" },
  { key: "youknow", label: "YOU KNOW" },
  { key: "and", label: "AND" },
];

interface AhCounterReportDisplayProps {
  data: AhCounterReportData;
}

export default function AhCounterReportDisplay({
  data,
}: AhCounterReportDisplayProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
        FILLER WORDS
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">
                NAME
              </th>
              {COUNT_FIELDS.map((field) => (
                <th
                  key={field.key}
                  className="px-5 py-3 text-center font-medium uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.people.map((person, index) => (
              <tr
                key={index}
                className={`${index !== data.people.length - 1 ? "border-b border-border" : ""}`}
              >
                <td className="px-5 py-4 text-foreground">{person.name}</td>
                {COUNT_FIELDS.map((field) => (
                  <td
                    key={field.key}
                    className="px-5 py-4 text-center text-foreground"
                  >
                    {person[field.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
