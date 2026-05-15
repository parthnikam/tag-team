"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ROOM_ROLE_LABELS } from "@/lib/roles";
import {
  createEmptyGrammarianPerson,
  type GrammarianPerson,
  type GrammarianReportData,
} from "@/lib/report-data";

export default function GrammarianReportForm({
  code,
  initialSubmitted,
}: {
  code: string;
  initialSubmitted: boolean;
}) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<GrammarianReportData>({
    wod: "",
    meaning: "",
    general: "",
    people: [createEmptyGrammarianPerson()],
  });

  const updatePerson = (
    index: number,
    field: keyof GrammarianPerson,
    value: string,
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
          role: "grammarian",
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
          <h1 className="text-lg">{ROOM_ROLE_LABELS.grammarian}</h1>
          <p className="mt-1 text-sm text-white/60">
            Capture the word of the day, general notes, and feedback per speaker.
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
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-white/60">Word of the day</span>
            <input
              value={form.wod}
              onChange={(event) =>
                setForm((current) => ({ ...current, wod: event.target.value }))
              }
              className="rounded border border-white/20 bg-transparent px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-white/60">Meaning</span>
            <input
              value={form.meaning}
              onChange={(event) =>
                setForm((current) => ({ ...current, meaning: event.target.value }))
              }
              className="rounded border border-white/20 bg-transparent px-3 py-2"
            />
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="text-white/60">General notes</span>
          <textarea
            value={form.general}
            onChange={(event) =>
              setForm((current) => ({ ...current, general: event.target.value }))
            }
            className="min-h-28 rounded border border-white/20 bg-transparent px-3 py-2"
          />
        </label>
      </section>

      <section className="rounded border border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base">People</h2>
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                people: [...current.people, createEmptyGrammarianPerson()],
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
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-white/60">Name</span>
                  <input
                    value={person.name}
                    onChange={(event) => updatePerson(index, "name", event.target.value)}
                    className="rounded border border-white/20 bg-transparent px-3 py-2"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-white/60">Highlights</span>
                  <input
                    value={person.highlights}
                    onChange={(event) =>
                      updatePerson(index, "highlights", event.target.value)
                    }
                    className="rounded border border-white/20 bg-transparent px-3 py-2"
                  />
                </label>
              </div>

              <label className="mt-3 flex flex-col gap-1 text-sm">
                <span className="text-white/60">Improvement</span>
                <textarea
                  value={person.improvement}
                  onChange={(event) =>
                    updatePerson(index, "improvement", event.target.value)
                  }
                  className="min-h-24 rounded border border-white/20 bg-transparent px-3 py-2"
                />
              </label>

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
