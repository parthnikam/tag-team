"use client";

import { useEffect, useState, useTransition } from "react";
import BackLink from "@/components/back-link";
import { setCachedRoomSession, useCachedRoomSession } from "@/components/room-session-cache";
import {
  clearRoleReportDraft,
  getRoleReportDraft,
  setRoleReportDraft,
} from "@/components/role-report-draft-cache";
import { Send, Trash2 } from "lucide-react";

interface ImproperUseEntry {
  id: string;
  name: string;
  whatWasSaid: string;
  suggestion: string;
}

interface NotablePhraseEntry {
  id: string;
  name: string;
  phrase: string;
  meaning: string;
}

type GrammarianDraft = {
  wod: string;
  meaning: string;
  improperUseEntries: ImproperUseEntry[];
  notablePhraseEntries: NotablePhraseEntry[];
};

export default function GrammarianReportForm({
  code,
  initialSubmitted,
  initialWod,
  initialMeaning,
  meetingName,
  hostName,
}: {
  code: string;
  initialSubmitted: boolean;
  initialWod?: string;
  initialMeaning?: string;
  meetingName?: string;
  hostName?: string;
}) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [showWodModal, setShowWodModal] = useState(
    () =>
      !initialSubmitted &&
      !(getRoleReportDraft<GrammarianDraft>(code, "grammarian")?.wod || initialWod),
  );
  const [isPending, startTransition] = useTransition();
  const [wod, setWod] = useState(
    () => getRoleReportDraft<GrammarianDraft>(code, "grammarian")?.wod ?? initialWod ?? "",
  );
  const [meaning, setMeaning] = useState(
    () =>
      getRoleReportDraft<GrammarianDraft>(code, "grammarian")?.meaning ??
      initialMeaning ??
      "",
  );
  const cachedRoom = useCachedRoomSession(code);
  const displayMeetingName = cachedRoom?.clubName || meetingName;
  const displayHostName = cachedRoom?.hostName || hostName;
  const [improperUseEntries, setImproperUseEntries] = useState<ImproperUseEntry[]>(
    () =>
      getRoleReportDraft<GrammarianDraft>(code, "grammarian")?.improperUseEntries ??
      [],
  );
  const [notablePhraseEntries, setNotablePhraseEntries] = useState<NotablePhraseEntry[]>(
    () =>
      getRoleReportDraft<GrammarianDraft>(code, "grammarian")?.notablePhraseEntries ??
      [],
  );

  useEffect(() => {
    if (submitted) {
      return;
    }

    setRoleReportDraft<GrammarianDraft>(code, "grammarian", {
      wod,
      meaning,
      improperUseEntries,
      notablePhraseEntries,
    });
  }, [code, improperUseEntries, meaning, notablePhraseEntries, submitted, wod]);

  const addImproperUseEntry = () => {
    setImproperUseEntries([
      ...improperUseEntries,
      { id: Date.now().toString(), name: "", whatWasSaid: "", suggestion: "" },
    ]);
  };

  const updateImproperUseEntry = (
    id: string,
    field: keyof Omit<ImproperUseEntry, "id">,
    value: string,
  ) => {
    setImproperUseEntries(
      improperUseEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const removeImproperUseEntry = (id: string) => {
    setImproperUseEntries(improperUseEntries.filter((entry) => entry.id !== id));
  };

  const addNotablePhraseEntry = () => {
    setNotablePhraseEntries([
      ...notablePhraseEntries,
      { id: Date.now().toString(), name: "", phrase: "", meaning: "" },
    ]);
  };

  const updateNotablePhraseEntry = (
    id: string,
    field: keyof Omit<NotablePhraseEntry, "id">,
    value: string,
  ) => {
    setNotablePhraseEntries(
      notablePhraseEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const removeNotablePhraseEntry = (id: string) => {
    setNotablePhraseEntries(notablePhraseEntries.filter((entry) => entry.id !== id));
  };

  const handleSetWod = () => {
    if (!wod.trim() || !meaning.trim()) {
      setModalError("Please enter both a word of the day and its meaning.");
      return;
    }

    setModalError("");

    startTransition(async () => {
      const response = await fetch("/api/updateroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          role: "grammarian",
          updates: {
            wod: wod.trim(),
            meaning: meaning.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalError(data.error ?? "Could not save word of the day.");
        return;
      }

      setShowWodModal(false);
      setCachedRoomSession({ code, wod: wod.trim(), meaning: meaning.trim() });
    });
  };

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
        body: JSON.stringify({
          code,
          role: "grammarian",
          data: {
            wod,
            meaning,
            improperUseEntries,
            notablePhraseEntries,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not submit data.");
        return;
      }

      setSubmitted(true);
      clearRoleReportDraft(code, "grammarian");
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-32">
      {showWodModal ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/35 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[#E7E7E7] bg-white p-6 shadow-[0_24px_90px_rgba(10,10,10,0.2)]">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
                  Word of the day
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#0A0A0A]">
                  Set the word of the day
                </h2>
              </div>

              <div className="grid gap-4">
                <label className="text-sm font-medium text-[#0A0A0A]">
                  Word of the day
                  <input
                    type="text"
                    value={wod}
                    onChange={(event) => setWod(event.target.value)}
                    className="mt-2 w-full rounded-full border border-[#E7E7E7] bg-white px-5 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0A0A0A]"
                    placeholder="Enter the word of the day"
                  />
                </label>

                <label className="text-sm font-medium text-[#0A0A0A]">
                  Meaning
                  <textarea
                    value={meaning}
                    onChange={(event) => setMeaning(event.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-[1rem] border border-[#E7E7E7] bg-white px-5 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0A0A0A]"
                    placeholder="Enter the meaning of the word"
                  />
                </label>

                {modalError ? (
                  <p className="text-sm text-[#B42318]">{modalError}</p>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSetWod}
                    className="inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-6 py-3 text-sm font-semibold text-white transition-colors"
                  >
                    Set word of the day
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-b border-[#ECECEC] pb-4">
        <BackLink href={`/room/${code}`} label="Lobby" />
        <p className="hidden text-xs font-medium uppercase tracking-[0.28em] text-[#667085] sm:block">
          {displayMeetingName}
        </p>
        <p className="hidden text-sm text-[#667085] sm:block">{displayHostName}</p>
      </div>

      <div className="page-heading-inset">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
          Grammarian
        </p>
        <h1 className="mt-2 text-[2.85rem] font-semibold tracking-[-0.06em] text-[#0A0A0A] sm:text-[3.4rem]">
          Grammarian Dashboard
        </h1>
        <p className="mt-2 text-[1rem] text-[#667085]">
          Log the word of the day, improper word usage, and notable phrasing.
        </p>
      </div>

      {/* Word of the Day Section */}
      <section className="rounded-[2rem] border border-[#E7E7E7] bg-[#F7F7F7] p-4 sm:p-5">
        <div className="mb-4 text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
          Word of the day
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.85rem] font-semibold text-[#0A0A0A]">
            {wod || "nothing"}
            </h2>
            <p className="mt-2 text-sm text-[#667085]">{meaning || "it means to do be in a state of nothingness"}</p>
          </div>
        </div>
      </section>

      {/* Notable Phrasing Section */}
      <section className="rounded-[2rem] border border-[#E7E7E7] p-4 sm:p-5">
        <h2 className="text-[1.15rem] font-semibold text-[#0A0A0A]">Notable Phrasing</h2>
        <p className="mt-1 text-sm text-[#667085]">Capture eloquent words, quotes, or phrases.</p>

        <div className="mt-6 space-y-3">
          {notablePhraseEntries.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#667085]">
              Add entries to start capturing notable phrasing.
            </div>
          ) : (
            notablePhraseEntries.map((entry) => (
              <div key={entry.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_2.5rem] sm:items-center">
                <input
                  type="text"
                  placeholder="Name"
                  value={entry.name}
                  onChange={(event) =>
                    updateNotablePhraseEntry(entry.id, "name", event.target.value)
                  }
                  className="sm:col-span-1 w-full min-w-0 rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] focus:border-[#0A0A0A]"
                />
                <div className="grid min-w-0 gap-2 sm:col-span-1">
                  <input
                    type="text"
                    placeholder="The quote or phrase"
                    value={entry.phrase}
                    onChange={(event) =>
                      updateNotablePhraseEntry(entry.id, "phrase", event.target.value)
                    }
                    className="w-full min-w-0 rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] focus:border-[#0A0A0A]"
                  />
                  <input
                    type="text"
                    placeholder="Meaning or impact"
                    value={entry.meaning}
                    onChange={(event) =>
                      updateNotablePhraseEntry(entry.id, "meaning", event.target.value)
                    }
                    className="w-full min-w-0 rounded-full border border-[#E7E7E7] px-6 py-3 text-sm text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] focus:border-[#0A0A0A]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNotablePhraseEntry(entry.id)}
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#667085] transition-colors"
                  aria-label="Remove notable phrase entry"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={addNotablePhraseEntry}
          className="mt-4 p-2 rounded-xl text-sm font-medium text-[#0A0A0A] transition-colors"
        >
          + Add entry
        </button>
      </section>

      {/* Improper Use Section */}
      <section className="rounded-[2rem] border border-[#E7E7E7] p-4 sm:p-5">
        <h2 className="text-[1.15rem] font-semibold text-[#0A0A0A]">Improper Use</h2>
        <p className="mt-1 text-sm text-[#667085]">Note misuse and suggest a correction.</p>

        <div className="mt-6 space-y-3">
          {improperUseEntries.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#667085]">
              Add entries to start logging improper usage.
            </div>
          ) : (
            improperUseEntries.map((entry) => (
              <div key={entry.id} className="grid gap-2 sm:grid-cols-3 sm:items-center">
                <input
                  type="text"
                  placeholder="Name"
                  value={entry.name}
                  onChange={(event) =>
                    updateImproperUseEntry(entry.id, "name", event.target.value)
                  }
                className="sm:col-span-1 w-full min-w-0 rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] focus:border-[#0A0A0A]"
                />
                <input
                  type="text"
                  placeholder="What was said"
                  value={entry.whatWasSaid}
                  onChange={(event) =>
                    updateImproperUseEntry(entry.id, "whatWasSaid", event.target.value)
                  }
                className="sm:col-span-1 w-full min-w-0 rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] focus:border-[#0A0A0A]"
                />
                <div className="flex gap-3 items-center sm:col-span-1">
                  <input
                    type="text"
                    placeholder="Suggestion"
                    value={entry.suggestion}
                    onChange={(event) =>
                      updateImproperUseEntry(entry.id, "suggestion", event.target.value)
                    }
                className="flex-1 min-w-0 rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] focus:border-[#0A0A0A]"
                  />
                  <button
                    type="button"
                    onClick={() => removeImproperUseEntry(entry.id)}
                    className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#667085] transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={addImproperUseEntry}
          className="mt-4 text-sm rounded-xl p-2 font-medium text-[#0A0A0A] transition-colors"
        >
          + Add entry
        </button>
      </section>

      {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-6">
        <section className="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-[#E7E7E7] bg-white/95 p-4 shadow-[0_-10px_30px_rgba(10,10,10,0.05)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[1rem] text-[#667085]">When ready, send to the host.</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitted || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A0A0A] px-6 py-3 text-[1rem] font-semibold text-white transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitted ? "Report submitted" : isPending ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
