"use client";

import { useEffect, useState, useTransition } from "react";
import BackLink from "@/components/back-link";
import { useCachedRoomSession } from "@/components/room-session-cache";
import {
  clearRoleReportDraft,
  getRoleReportDraft,
  setRoleReportDraft,
} from "@/components/role-report-draft-cache";
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

type TimerDraft = {
  activeSection: TimerSectionKey;
  currentSpeaker: string;
  elapsedSeconds: number;
  form: TimerReportData;
};

const createEmptyTimerReport = (): TimerReportData => ({
  tabletopics: [createEmptyTimerPerson()],
  speeches: [createEmptyTimerPerson()],
  evaluators: [createEmptyTimerPerson()],
});

const formatSeconds = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const parseTimeInput = (value: string) => {
  const numericString = value.replace(/\D/g, "");

  if (!numericString) {
    return 0;
  }

  if (numericString.length <= 2) {
    return Number(numericString);
  }

  const secondsStr = numericString.slice(-2);
  const minutesStr = numericString.slice(0, -2);

  return Number(minutesStr) * 60 + Number(secondsStr);
};

const getTimerTone = (elapsedSeconds: number, targets: [number, number, number]) => {
  if (elapsedSeconds >= targets[2]) {
    return {
      section: "border-destructive bg-destructive/10",
      time: "text-destructive",
      meta: "text-destructive",
      button: "bg-destructive text-destructive-foreground",
    };
  }

  if (elapsedSeconds >= targets[1]) {
    return {
      section: "border-yellow-500 bg-yellow-500/10",
      time: "text-yellow-700 dark:text-yellow-300",
      meta: "text-yellow-700 dark:text-yellow-300",
      button: "bg-yellow-600 text-background dark:bg-yellow-400",
    };
  }

  if (elapsedSeconds >= targets[0]) {
    return {
      section: "border-emerald-500 bg-emerald-500/10",
      time: "text-emerald-700 dark:text-emerald-300",
      meta: "text-emerald-700 dark:text-emerald-300",
      button: "bg-emerald-700 text-background dark:bg-emerald-400",
    };
  }

  return {
    section: "border-border bg-card",
    time: "text-foreground",
    meta: "text-muted-foreground",
    button: "bg-primary text-primary-foreground",
  };
};

function TimeInput({
  time,
  onChange,
  onFocus,
}: {
  time: number;
  onChange: (value: string) => void;
  onFocus: () => void;
}) {
  const [localValue, setLocalValue] = useState<string | null>(null);
  const [lastReportedTime, setLastReportedTime] = useState(time);

  if (time !== lastReportedTime) {
    setLocalValue(null);
    setLastReportedTime(time);
  }

  const displayValue = localValue !== null ? localValue : formatSeconds(time);

  return (
    <input
      value={displayValue}
      onChange={(event) => {
        const newVal = event.target.value;
        setLocalValue(newVal);
        setLastReportedTime(parseTimeInput(newVal));
        onChange(newVal);
      }}
      onBlur={() => setLocalValue(null)}
      onFocus={onFocus}
      className="w-40 rounded-full border border-border px-5 py-3 text-center text-[1rem] text-muted-foreground outline-none transition-colors focus:border-primary"
    />
  );
}

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
    <section className="rounded-[2rem] border border-border p-4 sm:p-5">
      <h2 className="text-[1.15rem] font-semibold text-foreground sm:text-[1.35rem]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
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
              className="min-w-0 flex-1 rounded-full border border-border px-5 py-3 text-[1rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />

            <div className="flex items-center gap-3 sm:w-auto">
              <TimeInput
                time={person.time}
                onChange={(value) => onTimeChange(index, value)}
                onFocus={() => onFocus(index)}
              />

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors"
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
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[1rem] font-medium text-foreground transition-colors"
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
  const [activeSection, setActiveSection] = useState<TimerSectionKey>(
    () => getRoleReportDraft<TimerDraft>(code, "timer")?.activeSection ?? "speeches",
  );
  const [currentSpeaker, setCurrentSpeaker] = useState(
    () => getRoleReportDraft<TimerDraft>(code, "timer")?.currentSpeaker ?? "",
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(
    () => getRoleReportDraft<TimerDraft>(code, "timer")?.elapsedSeconds ?? 0,
  );
  const [isRunning, setIsRunning] = useState(false);
  const cachedRoom = useCachedRoomSession(code);
  const displayMeetingName = cachedRoom?.clubName || meetingName;
  const displayHostName = cachedRoom?.hostName || hostName;
  const [form, setForm] = useState<TimerReportData>(
    () => getRoleReportDraft<TimerDraft>(code, "timer")?.form ?? createEmptyTimerReport(),
  );

  useEffect(() => {
    if (submitted) {
      return;
    }

    setRoleReportDraft<TimerDraft>(code, "timer", {
      activeSection,
      currentSpeaker,
      elapsedSeconds,
      form,
    });
  }, [activeSection, code, currentSpeaker, elapsedSeconds, form, submitted]);

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
      clearRoleReportDraft(code, "timer");
    });
  };

  const activeConfig = TIMER_SECTIONS.find((section) => section.key === activeSection)!;
  const timerTone = getTimerTone(elapsedSeconds, activeConfig.targets);
  const activeSpeakerNames = form[activeSection]
    .map((person) => person.name.trim())
    .filter(Boolean);

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
          Timer
        </p>
        <h1 className="mt-2 text-[2.85rem] font-semibold tracking-[-0.06em] text-foreground sm:text-[3.4rem]">
          Timer Dashboard
        </h1>
        <p className="mt-2 text-[1rem] text-muted-foreground">
          Run the live timer, then record the duration to the speaker&apos;s row.
        </p>
      </div>

     <section className="rounded-3xl border bg-card p-4 text-card-foreground sm:p-5">
      <div className="flex flex-wrap gap-2">
        {TIMER_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            aria-pressed={activeSection === section.key}
            onClick={() => setActiveSection(section.key)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
              activeSection === section.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {section.shortTitle}
          </button>
        ))}
      </div>

        <div className="mt-8 text-center">
          <div className={`select-none text-[5.6rem] font-semibold leading-none tracking-[-0.08em] transition-colors sm:text-[7rem] ${timerTone.time}`}>
            {formatSeconds(elapsedSeconds)}
          </div>
          <p className={`mt-3 text-sm uppercase tracking-[0.26em] transition-colors ${timerTone.meta}`}>
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
            className="w-full rounded-full border border-border px-6 py-3 text-[1rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[1rem] font-semibold transition-colors ${timerTone.button}`}
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
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-[1rem] font-medium text-foreground transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={recordCurrentTime}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 text-[1rem] font-medium text-foreground transition-colors"
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-6">
        <section className="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[1rem] text-muted-foreground">When ready, send to the host.</p>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitted || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[1rem] font-semibold text-primary-foreground transition-colors disabled:opacity-50"
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
