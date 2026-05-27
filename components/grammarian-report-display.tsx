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
      meaning?: string;
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
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
          WORD OF THE DAY
        </p>
        <div className="mt-3 rounded-xl bg-muted p-6">
          <div className="text-2xl font-semibold text-foreground">
            {data.wod || "—"}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {data.meaning || "No meaning provided"}
          </div>
        </div>
      </div>

      {/* Improper Use */}
      {data.improperUseEntries && data.improperUseEntries.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
            IMPROPER USE
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    NAME
                  </th>
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    IMPROPER
                  </th>
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">
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
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-foreground">{entry.name}</td>
                    <td className="px-5 py-4 text-foreground">
                      {entry.whatWasSaid}
                    </td>
                    <td className="px-5 py-4 text-foreground">
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
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
            NOTABLE PHRASING
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    NAME
                  </th>
                  <th className="px-5 py-3 text-left font-medium uppercase tracking-[0.15em] text-muted-foreground">
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
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-foreground">{entry.name}</td>
                    <td className="px-5 py-4 text-foreground">
                      <div className="italic">&ldquo;{entry.phrase}&rdquo;</div>
                      {entry.meaning ? (
                        <div className="mt-1 text-sm not-italic text-muted-foreground">
                          {entry.meaning}
                        </div>
                      ) : null}
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
