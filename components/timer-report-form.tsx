"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ROOM_ROLE_LABELS } from "@/lib/roles";
import {
  createEmptyTimerPerson,
  type TimerPerson,
  type TimerReportData,
} from "@/lib/report-data";

const updatePersonAtIndex = (
  people: TimerPerson[],
  index: number,
  field: keyof TimerPerson,
  value: string | number,
) =>
  people.map((person, currentIndex) =>
    currentIndex === index ? { ...person, [field]: value } : person,
  );

function TimerSection({
  title,
  people,
  onAdd,
  onRemove,
  onChange,
}: {
  title: string;
  people: TimerPerson[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof TimerPerson, value: string | number) => void;
}) {
  return (
    <section className="rounded border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded border border-white/20 px-3 py-1 text-sm"
        >
          Add person
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {people.map((person, index) => (
          <div key={`${title}-${index}`} className="rounded border border-white/10 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-white/60">Name</span>
                <input
                  value={person.name}
                  onChange={(event) => onChange(index, "name", event.target.value)}
                  className="rounded border border-white/20 bg-transparent px-3 py-2"
                  placeholder="Speaker name"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-white/60">Time</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={person.time}
                  onChange={(event) =>
                    onChange(index, "time", Number(event.target.value) || 0)
                  }
                  className="rounded border border-white/20 bg-transparent px-3 py-2"
                  placeholder="0"
                />
              </label>
            </div>

            {people.length > 1 ? (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-3 text-sm text-red-300"
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TimerReportForm({
  code,
  initialSubmitted,
}: {
  code: string;
  initialSubmitted: boolean;
}) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<TimerReportData>({
    tabletopics: [createEmptyTimerPerson()],
    speeches: [createEmptyTimerPerson()],
    evaluators: [createEmptyTimerPerson()],
  });

  const updateSection = (
    section: keyof TimerReportData,
    index: number,
    field: keyof TimerPerson,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [section]: updatePersonAtIndex(current[section], index, field, value),
    }));
  };

  const addPerson = (section: keyof TimerReportData) => {
    setForm((current) => ({
      ...current,
      [section]: [...current[section], createEmptyTimerPerson()],
    }));
  };

  const removePerson = (section: keyof TimerReportData, index: number) => {
    setForm((current) => ({
      ...current,
      [section]: current[section].filter((_, currentIndex) => currentIndex !== index),
    }));
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
          role: "timer",
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

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 rounded border border-white/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-white/60">Room {code}</p>
          <h1 className="text-lg">{ROOM_ROLE_LABELS.timer}</h1>
          <p className="mt-1 text-sm text-white/60">
            Record timings for table topics, speeches, and evaluators.
          </p>
        </div>

        <Link
          href={`/room/${code}/reports`}
          className="rounded border border-white/20 px-3 py-2 text-sm"
        >
          View reports
        </Link>
      </div>

      <TimerSection
        title="Table Topics"
        people={form.tabletopics}
        onAdd={() => addPerson("tabletopics")}
        onRemove={(index) => removePerson("tabletopics", index)}
        onChange={(index, field, value) =>
          updateSection("tabletopics", index, field, value)
        }
      />

      <TimerSection
        title="Speeches"
        people={form.speeches}
        onAdd={() => addPerson("speeches")}
        onRemove={(index) => removePerson("speeches", index)}
        onChange={(index, field, value) =>
          updateSection("speeches", index, field, value)
        }
      />

      <TimerSection
        title="Evaluators"
        people={form.evaluators}
        onAdd={() => addPerson("evaluators")}
        onRemove={(index) => removePerson("evaluators", index)}
        onChange={(index, field, value) =>
          updateSection("evaluators", index, field, value)
        }
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitted || isPending}
        className="rounded border px-3 py-3 text-sm disabled:opacity-50"
      >
        {submitted ? "Already submitted" : isPending ? "Submitting..." : "Submit report"}
      </button>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
