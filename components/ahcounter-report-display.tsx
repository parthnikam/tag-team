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
  { key: "repeats", label: "REPEATS" },
  { key: "other", label: "OTHER" },
];

interface AhCounterReportDisplayProps {
  data: AhCounterReportData;
}

export default function AhCounterReportDisplay({
  data,
}: AhCounterReportDisplayProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
        FILLER WORDS
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-[#EAEAEA] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAEAEA] bg-[#F5F5F5]">
              <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-[#475467]">
                NAME
              </th>
              {COUNT_FIELDS.map((field) => (
                <th
                  key={field.key}
                  className="px-5 py-3 text-center font-medium uppercase tracking-[0.15em] text-[#475467]"
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
                className={`${index !== data.people.length - 1 ? "border-b border-[#EAEAEA]" : ""}`}
              >
                <td className="px-5 py-4 text-[#0A0A0A]">{person.name}</td>
                {COUNT_FIELDS.map((field) => (
                  <td
                    key={field.key}
                    className="px-5 py-4 text-center text-[#0A0A0A]"
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
