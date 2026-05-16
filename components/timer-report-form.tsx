"use client";

import { useEffect, useState, useTransition } from "react";
import BackLink from "@/components/back-link";
import {
  Play,
  RotateCcw,
  Send,
  Plus,
  Trash2,
  Pause,
  Save,
} from "lucide-react";
import {
  createEmptyTimerPerson,
  type TimerPerson,
  type TimerReportData,
} from "@/lib/report-data";

type TimerSectionKey = keyof TimerReportData;

const TIMER_SECTIONS: Array<{
  key: TimerSectionKey;
  title: string;
  shortTitle: string;
  targets: [number, number, number];
}> = [
  { key: "tabletopics", title: "Table Topics", shortTitle: "Table Topics", targets: [60, 90, 120] },
  { key: "speeches", title: "Prepared Speeches", shortTitle: "Prepared Speeches", targets: [300, 360, 420] },
  { key: "evaluators", title: "Evaluations", shortTitle: "Evaluations", targets: [120, 150, 180] },
];

const formatSeconds = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const parseTimeInput = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  if (trimmed.includes(":")) {
    const [minutes, seconds] = trimmed.split(":");
    const parsedMinutes = Number(minutes);
    const parsedSeconds = Number(seconds);

    if (Number.isNaN(parsedMinutes) || Number.isNaN(parsedSeconds)) {
      return 0;
    }

    return parsedMinutes * 60 + parsedSeconds;
  }

  const numericValue = Number(trimmed);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

function TimerSectionCard({
  title,
  targets,
  people,
  onAdd,
  onRemove,
  onNameChange,
  onTimeChange,
  onFocus,
}: {
  title: string;
  targets: [number, number, number];
  people: TimerPerson[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onNameChange: (index: number, value: string) => void;
  onTimeChange: (index: number, value: string) => void;
  onFocus: (index: number) => void;
}) {
  return (
    <section className="rounded-[2rem] border border-[#E7E7E7] p-4 sm:p-5">
      <h2 className="text-[1.15rem] font-semibold text-[#0A0A0A] sm:text-[1.35rem]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#667085]">
        Targets · {targets.map((value) => formatSeconds(value)).join(" / ")}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {people.map((person, index) => (
          <div key={`${title}-${index}`} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={person.name}
              onChange={(event) => onNameChange(index, event.target.value)}
              onFocus={() => onFocus(index)}
              placeholder="Name"
              className="min-w-0 flex-1 rounded-full border border-[#E7E7E7] px-5 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
            />

            <div className="flex items-center gap-3 sm:w-auto">
              <input
                value={formatSeconds(person.time)}
                onChange={(event) => onTimeChange(index, event.target.value)}
                onFocus={() => onFocus(index)}
                className="w-40 rounded-full border border-[#E7E7E7] px-5 py-3 text-center text-[1rem] text-[#475467] outline-none transition-colors hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
              />

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E7E7] text-[#667085] transition-colors hover:bg-[#F7F7F7] hover:text-[#0A0A0A]"
                aria-label={`Remove ${title} speaker ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E7E7E7] px-4 py-2 text-[1rem] font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7]"
      >
        <Plus className="h-4 w-4" />
        Add speaker
      </button>
    </section>
  );
}

export default function TimerReportForm({
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
  const [activeSection, setActiveSection] = useState<TimerSectionKey>("speeches");
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [form, setForm] = useState<TimerReportData>({
    tabletopics: [createEmptyTimerPerson()],
    speeches: [createEmptyTimerPerson()],
    evaluators: [createEmptyTimerPerson()],
  });

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning]);

  const updateSectionPerson = (
    section: TimerSectionKey,
    index: number,
    updates: Partial<TimerPerson>,
  ) => {
    setForm((current) => ({
      ...current,
      [section]: current[section].map((person, currentIndex) =>
        currentIndex === index ? { ...person, ...updates } : person,
      ),
    }));
  };

  const addPerson = (section: TimerSectionKey) => {
    setForm((current) => ({
      ...current,
      [section]: [...current[section], createEmptyTimerPerson()],
    }));
  };

  const removePerson = (section: TimerSectionKey, index: number) => {
    setForm((current) => ({
      ...current,
      [section]:
        current[section].length > 1
          ? current[section].filter((_, currentIndex) => currentIndex !== index)
          : [createEmptyTimerPerson()],
    }));
  };

  const recordCurrentTime = () => {
    const trimmedSpeaker = currentSpeaker.trim();

    if (!trimmedSpeaker) {
      setError("Enter or select the current speaker before recording.");
      return;
    }

    let didMatch = false;

    setForm((current) => {
      const existingMatchIndex = current[activeSection].findIndex(
        (person) => person.name.trim().toLowerCase() === trimmedSpeaker.toLowerCase(),
      );
      const firstEmptyIndex = current[activeSection].findIndex(
        (person) => !person.name.trim(),
      );

      const updatedSection = current[activeSection].map((person, index) => {
        if (index === existingMatchIndex) {
          didMatch = true;
          return {
            ...person,
            time: elapsedSeconds,
          };
        }

        if (existingMatchIndex === -1 && index === firstEmptyIndex) {
          didMatch = true;
          return {
            ...person,
            name: trimmedSpeaker,
            time: elapsedSeconds,
          };
        }

        return person;
      });

      return {
        ...current,
        [activeSection]: didMatch
          ? updatedSection
          : [...updatedSection, { name: trimmedSpeaker, time: elapsedSeconds }],
      };
    });

    setError("");
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

  const activeConfig = TIMER_SECTIONS.find((section) => section.key === activeSection)!;
  const activeSpeakerNames = form[activeSection]
    .map((person) => person.name.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-32">
      <div className="flex items-center justify-between gap-4 border-b border-[#ECECEC] pb-4">
        <BackLink href={`/room/${code}`} label="Lobby" />
        <p className="hidden text-xs font-medium uppercase tracking-[0.28em] text-[#667085] sm:block">
          {meetingName}
        </p>
        <p className="hidden text-sm text-[#667085] sm:block">{hostName}</p>
      </div>

      <div className="px-1">
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[#475467]">
          Timer
        </p>
        <h1 className="mt-2 text-[2.85rem] font-semibold tracking-[-0.06em] text-[#0A0A0A] sm:text-[3.4rem]">
          Timer Dashboard
        </h1>
        <p className="mt-2 text-[1rem] text-[#667085]">
          Run the live timer, then record the duration to the speaker&apos;s row.
        </p>
      </div>

      <section className="rounded-[2rem] border border-[#E7E7E7] p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {TIMER_SECTIONS.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className={`rounded-full px-5 py-2.5 text-[1rem] font-medium transition-colors ${
                activeSection === section.key
                  ? "bg-[#0A0A0A] text-white"
                  : "bg-[#F3F3F3] text-[#0A0A0A] hover:bg-[#ECECEC]"
              }`}
            >
              {section.shortTitle}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="select-none text-[5.6rem] font-semibold leading-none tracking-[-0.08em] text-[#0A0A0A] sm:text-[7rem]">
            {formatSeconds(elapsedSeconds)}
          </div>
          <p className="mt-3 text-sm uppercase tracking-[0.26em] text-[#667085]">
            GREEN {formatSeconds(activeConfig.targets[0])}
            <span className="mx-3">·</span>
            YELLOW {formatSeconds(activeConfig.targets[1])}
            <span className="mx-3">·</span>
            RED {formatSeconds(activeConfig.targets[2])}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <input
            value={currentSpeaker}
            onChange={(event) => setCurrentSpeaker(event.target.value)}
            list="timer-speakers"
            placeholder="Current speaker"
            className="w-full rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] text-[#0A0A0A] outline-none transition-colors placeholder:text-[#667085] hover:bg-[#F9F9F9] focus:border-[#0A0A0A]"
          />
          <datalist id="timer-speakers">
            {activeSpeakerNames.map((speakerName) => (
              <option key={speakerName} value={speakerName} />
            ))}
          </datalist>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-6 py-3 text-[1rem] font-semibold text-white transition-colors hover:bg-[#222222]"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Start"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setElapsedSeconds(0);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E7] px-6 py-3 text-[1rem] font-medium text-[#0A0A0A] transition-colors hover:bg-[#F7F7F7]"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={recordCurrentTime}
              className="inline-flex items-center gap-2 rounded-full bg-[#F3F3F3] px-6 py-3 text-[1rem] font-medium text-[#0A0A0A] transition-colors hover:bg-[#ECECEC]"
            >
              <Save className="h-4 w-4" />
              Record
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        {TIMER_SECTIONS.map((section) => (
          <TimerSectionCard
            key={section.key}
            title={section.title}
            targets={section.targets}
            people={form[section.key]}
            onAdd={() => addPerson(section.key)}
            onRemove={(index) => removePerson(section.key, index)}
            onNameChange={(index, value) => {
              updateSectionPerson(section.key, index, { name: value });
              setActiveSection(section.key);
            }}
            onTimeChange={(index, value) =>
              updateSectionPerson(section.key, index, { time: parseTimeInput(value) })
            }
            onFocus={(index) => {
              setActiveSection(section.key);
              const speakerName = form[section.key][index]?.name ?? "";
              if (speakerName.trim()) {
                setCurrentSpeaker(speakerName);
              }
            }}
          />
        ))}
      </div>

      {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-6">
        <section className="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-[#E7E7E7] bg-white/95 p-4 shadow-[0_-10px_30px_rgba(10,10,10,0.05)] backdrop-blur">
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
