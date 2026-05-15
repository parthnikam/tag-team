"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ROOM_ROLE_LABELS } from "@/lib/roles";
import {
  createEmptyAhCounterPerson,
  type AhCounterPerson,
  type AhCounterReportData,
} from "@/lib/report-data";

const COUNT_FIELDS: Array<keyof Omit<AhCounterPerson, "name">> = [
  "uh",
  "um",
  "so",
  "uk",
  "other",
];

export default function AhCounterReportForm({
  code,
  initialSubmitted,
}: {
  code: string;
  initialSubmitted: boolean;
}) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<AhCounterReportData>({
    people: [createEmptyAhCounterPerson()],
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

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 rounded border border-white/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-white/60">Room {code}</p>
          <h1 className="text-lg">{ROOM_ROLE_LABELS.ahcounter}</h1>
          <p className="mt-1 text-sm text-white/60">
            Track filler words for each participant.
          </p>
        </div>

        <Link
          href={`/room/${code}/reports`}
          className="rounded border border-white/20 px-3 py-2 text-sm"
        >
          View reports
        </Link>
      </div>

      <section className="rounded border border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base">People</h2>
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                people: [...current.people, createEmptyAhCounterPerson()],
              }))
            }
            className="rounded border border-white/20 px-3 py-1 text-sm"
          >
            Add person
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {form.people.map((person, index) => (
            <div key={index} className="rounded border border-white/10 p-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-white/60">Name</span>
                <input
                  value={person.name}
                  onChange={(event) => updatePerson(index, "name", event.target.value)}
                  className="rounded border border-white/20 bg-transparent px-3 py-2"
                />
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {COUNT_FIELDS.map((field) => (
                  <label key={field} className="flex flex-col gap-1 text-sm">
                    <span className="text-white/60">{field.toUpperCase()}</span>
                    <input
                      type="number"
                      min="0"
                      value={person[field]}
                      onChange={(event) =>
                        updatePerson(index, field, Number(event.target.value) || 0)
                      }
                      className="rounded border border-white/20 bg-transparent px-3 py-2"
                    />
                  </label>
                ))}
              </div>

              {form.people.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      people: current.people.filter(
                        (_, currentIndex) => currentIndex !== index,
                      ),
                    }))
                  }
                  className="mt-3 text-sm text-red-300"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

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
