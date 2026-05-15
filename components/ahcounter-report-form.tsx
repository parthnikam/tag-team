"use client";

import { useState, useTransition } from "react";
import BackLink from "@/components/back-link";
import { Send, Trash2, UserPlus } from "lucide-react";
import {
  createEmptyAhCounterPerson,
  type AhCounterPerson,
  type AhCounterReportData,
} from "@/lib/report-data";

const COUNT_FIELDS: Array<{
  key: keyof Omit<AhCounterPerson, "name">;
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
  const [newSpeakerName, setNewSpeakerName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [form, setForm] = useState<AhCounterReportData>({
    people: [],
  });

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
    field: keyof Omit<AhCounterPerson, "name">,
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
    });
  };

  const selectedPerson =
    selectedIndex === null ? null : (form.people[selectedIndex] ?? null);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-32">
      <div className="flex items-center justify-between gap-4 border-b border-[#ECECEC] pb-4">
        <BackLink href={`/room/${code}`} label="Lobby" />
        <p className="hidden text-xs font-medium uppercase tracking-[0.28em] text-[#667085] sm:block">
          {meetingName}
        </p>
        <p className="hidden text-sm text-[#667085] sm:block">{hostName}</p>
      </div>

      <div className="px-1">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
          Ah Counter
        </p>
        <h1 className="mt-2 text-[2.85rem] font-semibold tracking-[-0.06em] text-[#0A0A0A] sm:text-[3.4rem]">
          Ah Counter Dashboard
        </h1>
        <p className="mt-2 text-[1rem] text-[#667085]">
          Pick a speaker, then tap to count.
        </p>
      </div>

      <section className="rounded-[2rem] border border-[#E7E7E7] px-5 py-5 sm:px-7 sm:py-6">
        <h2 className="text-[1.15rem] font-semibold text-[#0A0A0A]">Participants</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {form.people.map((person, index) => {
            const label = person.name.trim() || `person ${index + 1}`;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${label}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`rounded-full px-5 py-2.5 text-[1rem] font-medium transition-colors ${
                  isSelected
                    ? "bg-[#0A0A0A] text-white"
                    : "border border-[#E5E5E5] bg-white text-[#0A0A0A] hover:bg-[#F7F7F7]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={newSpeakerName}
            onChange={(event) => setNewSpeakerName(event.target.value)}
            placeholder="Add speaker name"
            className="min-w-0 flex-1 rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
          />

          <button
            type="button"
            onClick={addSpeaker}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] px-6 py-3 text-[1rem] font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7]"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#E7E7E7] px-5 py-5 sm:px-7 sm:py-7">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
          Counting
        </p>
        <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#0A0A0A]">
          {selectedPerson?.name.trim() || "Select a participant"}
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {COUNT_FIELDS.map((field) => (
            <div
              key={field.key}
              onClick={() => {
                if (selectedIndex !== null) {
                  adjustCount(selectedIndex, field.key, 1);
                }
              }}
              className={`rounded-[1.8rem] border border-[#E7E7E7] px-5 py-7 text-center transition-colors ${
                selectedIndex === null ? "opacity-50" : "hover:bg-[#F8F8F8]"
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
              <div className="text-sm font-medium uppercase tracking-[0.26em] text-[#475467]">
                {field.label}
              </div>
              <div className="mt-3 text-[2.9rem] font-semibold tracking-[-0.06em] text-[#0A0A0A]">
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
                className="mt-2 text-[1rem] text-[#667085] transition-colors hover:text-[#0A0A0A]"
              >
                -1
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#E7E7E7] px-5 py-5 sm:px-7 sm:py-6">
        <h2 className="text-[1.15rem] font-semibold text-[#0A0A0A]">Live report</h2>

        <div className="mt-4 overflow-x-auto rounded-[1.75rem] border border-[#E7E7E7]">
          {form.people.length ? (
            <table className="min-w-full border-collapse">
            <thead className="bg-[#F7F7F7]">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-medium uppercase tracking-[0.22em] text-[#475467]">
                  Name
                </th>
                {COUNT_FIELDS.map((field) => (
                  <th
                    key={field.key}
                    className="px-4 py-4 text-center text-sm font-medium uppercase tracking-[0.22em] text-[#475467]"
                  >
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-4" />
              </tr>
            </thead>

            <tbody>
              {form.people.map((person, index) => (
                <tr key={`${person.name}-${index}`} className="border-t border-[#ECECEC]">
                  <td className="px-4 py-3">
                    <input
                      value={person.name}
                      onChange={(event) => updatePerson(index, "name", event.target.value)}
                      onFocus={() => setSelectedIndex(index)}
                      className="w-full min-w-44 rounded-full border border-[#E7E7E7] px-4 py-2.5 text-[1rem] text-[#0A0A0A] outline-none transition-colors hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
                    />
                  </td>

                  {COUNT_FIELDS.map((field) => (
                    <td key={field.key} className="px-4 py-3 text-center text-[1rem] text-[#0A0A0A]">
                      {person[field.key]}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E7E7] text-[#667085] transition-colors hover:bg-[#F7F7F7] hover:text-[#0A0A0A]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          ) : (
            <div className="px-5 py-8 text-sm text-[#667085]">
              Add participants to start the live report.
            </div>
          )}
        </div>
      </section>

      {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-6">
        <section className="mx-auto w-full max-w-5xl rounded-[1.75rem] border border-[#E7E7E7] bg-white/95 px-5 py-4 shadow-[0_-10px_30px_rgba(10,10,10,0.05)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[1rem] text-[#667085]">When ready, send to the host.</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitted || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A0A0A] px-6 py-3 text-[1rem] font-semibold text-white transition-colors hover:bg-[#222222] disabled:opacity-50"
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
