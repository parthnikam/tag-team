interface GrammarianReportDisplayProps {
  data: {
    wod?: string;
    meaning?: string;
    improperUseEntries?: Array<{
      id?: string;
      name: string;
      whatWasSaid: string;
      suggestion: string;
    }>;
    notablePhraseEntries?: Array<{
      id?: string;
      name: string;
      phrase: string;
    }>;
  };
}

export default function GrammarianReportDisplay({
  data,
}: GrammarianReportDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Word of the Day */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
          WORD OF THE DAY
        </p>
        <div className="mt-3 rounded-xl bg-[#F5F5F5] p-6">
          <div className="text-2xl font-semibold text-[#0A0A0A]">
            {data.wod || "—"}
          </div>
          <div className="mt-2 text-sm text-[#667085]">
            {data.meaning || "No meaning provided"}
          </div>
        </div>
      </div>

      {/* Improper Use */}
      {data.improperUseEntries && data.improperUseEntries.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
            IMPROPER USE
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#EAEAEA] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EAEAEA] bg-[#F5F5F5]">
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-[#475467]">
                    NAME
                  </th>
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-[#475467]">
                    IMPROPER
                  </th>
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-[#475467]">
                    SUGGESTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.improperUseEntries.map((entry, index) => (
                  <tr
                    key={entry.id || index}
                    className={`${
                      index !== data.improperUseEntries!.length - 1
                        ? "border-b border-[#EAEAEA]"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-[#0A0A0A]">{entry.name}</td>
                    <td className="px-5 py-4 text-[#0A0A0A]">
                      {entry.whatWasSaid}
                    </td>
                    <td className="px-5 py-4 text-[#0A0A0A]">
                      {entry.suggestion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notable Phrasing */}
      {data.notablePhraseEntries && data.notablePhraseEntries.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
            NOTABLE PHRASING
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-[#EAEAEA] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EAEAEA] bg-[#F5F5F5]">
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-[#475467]">
                    NAME
                  </th>
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-[#475467]">
                    WHAT DID THEY SAY?
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.notablePhraseEntries.map((entry, index) => (
                  <tr
                    key={entry.id || index}
                    className={`${
                      index !== data.notablePhraseEntries!.length - 1
                        ? "border-b border-[#EAEAEA]"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-[#0A0A0A]">{entry.name}</td>
                    <td className="px-5 py-4 text-[#0A0A0A] italic">
                      "{entry.phrase}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
