"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import BackLink from "@/components/back-link";
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
    <div className="page-panel">
      <BackLink href={`/room/${code}`} label="Back" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">Room {code}</p>
          <h1 className="page-title mt-3">{ROOM_ROLE_LABELS.grammarian}</h1>
          <p className="page-copy mt-3">
            Capture the word of the day, general notes, and feedback per speaker.
          </p>
        </div>

        <Link
          href={`/room/${code}/reports`}
          className="surface-button-secondary"
        >
          View reports
        </Link>
      </div>

      <section className="surface-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="section-label">Word of the day</span>
            <input
              value={form.wod}
              onChange={(event) =>
                setForm((current) => ({ ...current, wod: event.target.value }))
              }
              className="surface-input"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="section-label">Meaning</span>
            <input
              value={form.meaning}
              onChange={(event) =>
                setForm((current) => ({ ...current, meaning: event.target.value }))
              }
              className="surface-input"
            />
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="section-label">General notes</span>
          <textarea
            value={form.general}
            onChange={(event) =>
              setForm((current) => ({ ...current, general: event.target.value }))
            }
            className="surface-input min-h-32"
          />
        </label>
      </section>

      <section className="surface-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0A0A0A]">People</h2>
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                people: [...current.people, createEmptyGrammarianPerson()],
              }))
            }
            className="surface-button-secondary"
          >
            Add person
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {form.people.map((person, index) => (
            <div key={index} className="rounded-3xl border border-[#EAEAEA] bg-[#FCFCFC] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="section-label">Name</span>
                  <input
                    value={person.name}
                    onChange={(event) => updatePerson(index, "name", event.target.value)}
                    className="surface-input"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  <span className="section-label">Highlights</span>
                  <input
                    value={person.highlights}
                    onChange={(event) =>
                      updatePerson(index, "highlights", event.target.value)
                    }
                    className="surface-input"
                  />
                </label>
              </div>

              <label className="mt-3 flex flex-col gap-1 text-sm">
                <span className="section-label">Improvement</span>
                <textarea
                  value={person.improvement}
                  onChange={(event) =>
                    updatePerson(index, "improvement", event.target.value)
                  }
                  className="surface-input min-h-28"
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
                  className="surface-button-ghost mt-4"
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
        className="surface-button"
      >
        {submitted ? "Already submitted" : isPending ? "Submitting..." : "Submit report"}
      </button>

      {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
    </div>
  );
}
