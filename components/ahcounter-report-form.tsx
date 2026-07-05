"use client";

import { useEffect, useState, useTransition } from "react";
import BackLink from "@/components/back-link";
import { useCachedRoomSession } from "@/components/room-session-cache";
import {
  clearRoleReportDraft,
  getRoleReportDraft,
  setRoleReportDraft,
} from "@/components/role-report-draft-cache";
import { Plus, Send, Trash2, UserPlus } from "lucide-react";
import {
  createEmptyAhCounterPerson,
  type AhCounterPerson,
  type AhCounterReportData,
} from "@/lib/report-data";

type DefaultCountKey = keyof Omit<AhCounterPerson, "name" | "customWords">;

const COUNT_FIELDS: Array<{
  key: DefaultCountKey;
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

type AhCounterDraft = {
  form: AhCounterReportData;
  newSpeakerName: string;
  selectedIndex: number | null;
  customWordInput: string;
};

export default function AhCounterReportForm({
  code,
  initialSubmitted,
  meetingName,
  hostName,
}: {
  code: string;
  initialSubmitted: boolean;
  meetingName: string;
  hostName: string;
}) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [newSpeakerName, setNewSpeakerName] = useState(
    () => getRoleReportDraft<AhCounterDraft>(code, "ahcounter")?.newSpeakerName ?? "",
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    () => getRoleReportDraft<AhCounterDraft>(code, "ahcounter")?.selectedIndex ?? null,
  );
  const [customWordInput, setCustomWordInput] = useState(
    () => getRoleReportDraft<AhCounterDraft>(code, "ahcounter")?.customWordInput ?? "",
  );
  const cachedRoom = useCachedRoomSession(code);
  const displayMeetingName = cachedRoom?.clubName || meetingName;
  const displayHostName = cachedRoom?.hostName || hostName;
  const [form, setForm] = useState<AhCounterReportData>(
    () => getRoleReportDraft<AhCounterDraft>(code, "ahcounter")?.form ?? { people: [] },
  );

  useEffect(() => {
    if (submitted) {
      return;
    }

    setRoleReportDraft<AhCounterDraft>(code, "ahcounter", {
      form,
      newSpeakerName,
      selectedIndex,
      customWordInput,
    });
  }, [code, customWordInput, form, newSpeakerName, selectedIndex, submitted]);

  const updatePerson = (
    index: number,
    field: keyof AhCounterPerson,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      people: current.people.map((person, currentIndex) =>
        currentIndex === index ? { ...person, [field]: value } : person,
      ),
    }));
  };

  const adjustCount = (
    index: number,
    field: DefaultCountKey,
    delta: number,
  ) => {
    setForm((current) => ({
      ...current,
      people: current.people.map((person, currentIndex) =>
        currentIndex === index
          ? {
              ...person,
              [field]: Math.max(0, person[field] + delta),
            }
          : person,
      ),
    }));
  };

  const adjustCustomWordCount = (index: number, word: string, delta: number) => {
    setForm((current) => ({
      ...current,
      people: current.people.map((person, currentIndex) => {
        if (currentIndex !== index) {
          return person;
        }

        const customWords = person.customWords ?? {};

        return {
          ...person,
          customWords: {
            ...customWords,
            [word]: Math.max(0, (customWords[word] ?? 0) + delta),
          },
        };
      }),
    }));
  };

  const addCustomWord = () => {
    if (selectedIndex === null) {
      setError("Select a participant before adding a custom word.");
      return;
    }

    const trimmedWord = customWordInput.trim();

    if (!trimmedWord) {
      return;
    }

    setForm((current) => ({
      ...current,
      people: current.people.map((person, currentIndex) => {
        if (currentIndex !== selectedIndex) {
          return person;
        }

        const customWords = person.customWords ?? {};
        const existingWord = Object.keys(customWords).find(
          (word) => word.toLowerCase() === trimmedWord.toLowerCase(),
        );
        const wordKey = existingWord ?? trimmedWord;

        return {
          ...person,
          customWords: {
            ...customWords,
            [wordKey]: customWords[wordKey] ?? 0,
          },
        };
      }),
    }));
    setCustomWordInput("");
    setError("");
  };

  const addSpeaker = () => {
    const trimmedName = newSpeakerName.trim();

    if (!trimmedName) {
      return;
    }

    setForm((current) => ({
      ...current,
      people: [...current.people, { ...createEmptyAhCounterPerson(), name: trimmedName }],
    }));
    setSelectedIndex(form.people.length);
    setNewSpeakerName("");
  };

  const removeSpeaker = (index: number) => {
    setForm((current) => ({
      ...current,
      people: current.people.filter((_, currentIndex) => currentIndex !== index),
    }));
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      if (current === index) {
        return form.people.length > 1 ? 0 : null;
      }

      return current > index ? current - 1 : current;
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
          role: "ahcounter",
          data: form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not submit data.");
        return;
      }

      setSubmitted(true);
      clearRoleReportDraft(code, "ahcounter");
    });
  };

  const selectedPerson =
    selectedIndex === null ? null : (form.people[selectedIndex] ?? null);
  const selectedCustomWords = Object.entries(selectedPerson?.customWords ?? {});
  const reportCustomWords = Array.from(
    new Set(
      form.people.flatMap((person) => Object.keys(person.customWords ?? {})),
    ),
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-32">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <BackLink href={`/room/${code}`} label="Lobby" />
        <p className="hidden text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground sm:block">
          {displayMeetingName}
        </p>
        <p className="hidden text-sm text-muted-foreground sm:block">{displayHostName}</p>
      </div>

          <div className="page-heading-inset">
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
              Ah Counter
            </p>
            <h1 className="mt-1 text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground sm:mt-2 sm:text-[2.85rem]">
              Ah Counter Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-[1rem]">
              Pick a speaker, then tap to count.
            </p>
          </div>

      <section className="rounded-[2rem] bg-card border border-border p-4 sm:p-5">
        <h2 className="text-[1.15rem] font-semibold text-foreground">Participants</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {form.people.map((person, index) => {
            const label = person.name.trim() || `person ${index + 1}`;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${label}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={newSpeakerName}
            onChange={(event) => setNewSpeakerName(event.target.value)}
            placeholder="Add speaker name"
            className="min-w-0 flex-1 rounded-full border border-border px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:px-6 sm:py-3 sm:text-[1rem]"
          />

          <button
            type="button"
            onClick={addSpeaker}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors sm:px-6 sm:py-3 sm:text-[1rem]"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] glass-flat-card border border-border p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground">
          Counting
        </p>
        <h2 className="mt-2 text-[1.25rem] font-semibold tracking-[-0.04em] text-foreground sm:text-[2rem]">
          {selectedPerson?.name.trim() || "Select a participant"}
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          {COUNT_FIELDS.map((field) => (
            <div
              key={field.key}
              onClick={() => {
                if (selectedIndex !== null) {
                  adjustCount(selectedIndex, field.key, 1);
                }
              }}
              className={`select-none flex flex-col items-center justify-center rounded-[1rem] border border-border px-2 py-2 text-center transition-colors sm:rounded-[1.8rem] sm:px-5 sm:py-4 ${
                selectedIndex === null ? "opacity-50" : ""
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && selectedIndex !== null) {
                  event.preventDefault();
                  adjustCount(selectedIndex, field.key, 1);
                }
              }}
            >
              <div className="mb-1 text-[0.6rem] font-medium uppercase leading-none tracking-[0.05em] text-muted-foreground sm:mb-0 sm:text-sm sm:tracking-[0.26em]">
                {field.label}
              </div>
              <div className="my-1 select-none text-[1.2rem] font-semibold leading-tight tracking-[-0.04em] text-foreground sm:my-0 sm:text-[1.8rem] sm:leading-none">
                {selectedPerson?.[field.key] ?? 0}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (selectedIndex !== null) {
                    adjustCount(selectedIndex, field.key, -1);
                  }
                }}
                className="px-3 py-1 text-sm text-muted-foreground transition-colors sm:px-10 sm:text-[1rem]"
              >
                -1
              </button>
            </div>
          ))}
          {selectedCustomWords.map(([word, count]) => (
            <div
              key={word}
              onClick={() => {
                if (selectedIndex !== null) {
                  adjustCustomWordCount(selectedIndex, word, 1);
                }
              }}
              className={`select-none flex flex-col items-center justify-center rounded-[1rem] border border-border px-1 py-3 text-center transition-colors sm:rounded-[1.8rem] sm:px-5 sm:py-4 ${
                selectedIndex === null ? "opacity-50" : ""
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && selectedIndex !== null) {
                  event.preventDefault();
                  adjustCustomWordCount(selectedIndex, word, 1);
                }
              }}
            >
              <div className="mb-1 max-w-full break-words text-[0.6rem] font-medium uppercase leading-none tracking-[0.05em] text-muted-foreground sm:mb-0 sm:text-sm sm:tracking-[0.18em]">
                {word}
              </div>
              <div className="my-1 select-none text-[1.8rem] font-semibold leading-tight tracking-[-0.06em] text-foreground sm:my-0 sm:text-[2.9rem] sm:leading-none">
                {count}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (selectedIndex !== null) {
                    adjustCustomWordCount(selectedIndex, word, -1);
                  }
                }}
                className="px-4 py-1 text-[0.8rem] text-muted-foreground transition-colors sm:px-10 sm:text-[1rem]"
              >
                -1
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={customWordInput}
            onChange={(event) => setCustomWordInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomWord();
              }
            }}
            placeholder={
              selectedPerson ? `Add word for ${selectedPerson.name || "speaker"}` : "Select a speaker first"
            }
            disabled={selectedIndex === null}
            className="min-w-0 flex-1 rounded-full border border-border px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-50 sm:px-5 sm:py-2.5"
          />

          <button
            type="button"
            onClick={addCustomWord}
            disabled={selectedIndex === null || !customWordInput.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors disabled:opacity-50 sm:px-5 sm:py-2.5"
          >
            <Plus className="h-4 w-4" />
            Add word
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] glass-flat-card border border-border p-4 sm:p-5">
        <h2 className="text-[1.15rem] font-semibold text-foreground">Live report</h2>

        <div className="mt-4 overflow-x-auto rounded-[1.75rem] border border-border">
          {form.people.length ? (
            <table className="min-w-full border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-2 text-left text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Name
                </th>
                {COUNT_FIELDS.map((field) => (
                  <th
                    key={field.key}
                    className="px-4 py-2 text-center text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground"
                  >
                    {field.label}
                  </th>
                ))}
                {reportCustomWords.map((word) => (
                  <th
                    key={word}
                    className="px-4 py-2 text-center text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {word}
                  </th>
                ))}
                <th className="px-4 py-2" />
              </tr>
            </thead>

            <tbody>
              {form.people.map((person, index) => (
                <tr key={`${person.name}-${index}`} className="border-t border-border">
                  <td className="px-2 py-1.5">
                        <input
                          value={person.name}
                          onChange={(event) => updatePerson(index, "name", event.target.value)}
                          onFocus={() => setSelectedIndex(index)}
                          className="w-full min-w-30 rounded-full border border-border px-3 py-1 text-sm text-foreground outline-none transition-colors focus:border-primary sm:px-4 sm:py-1.5 sm:text-[1rem]"
                        />
                  </td>

                  {COUNT_FIELDS.map((field) => (
                    <td key={field.key} className="px-3 py-1 text-center text-sm text-foreground sm:px-4 sm:py-1.5 sm:text-[1rem]">
                      {person[field.key]}
                    </td>
                  ))}

                  {reportCustomWords.map((word) => (
                    <td key={word} className="px-3 py-1 text-center text-sm text-foreground sm:px-4 sm:py-1.5 sm:text-[1rem]">
                      {person.customWords?.[word] ?? 0}
                    </td>
                  ))}

                  <td className="px-4 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          ) : (
            <div className="px-5 py-8 text-sm text-muted-foreground">
              Add participants to start the live report.
            </div>
          )}
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-6 sm:pb-6">
        <section className="glass-submit-card mx-auto w-full max-w-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[1rem] text-muted-foreground">When ready, send to the host.</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitted || isPending}
              className="button-outset-primary inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold sm:px-6 sm:py-3 sm:text-[1rem]"
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
