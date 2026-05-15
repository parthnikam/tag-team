export interface TimerPerson {
  name: string;
  time: number;
}

export interface TimerReportData {
  tabletopics: TimerPerson[];
  speeches: TimerPerson[];
  evaluators: TimerPerson[];
}

export interface GrammarianPerson {
  name: string;
  highlights: string;
  improvement: string;
}

export interface GrammarianReportData {
  wod: string;
  meaning: string;
  general: string;
  people: GrammarianPerson[];
}

export interface AhCounterPerson {
  name: string;
  uh: number;
  um: number;
  so: number;
  uk: number;
  other: number;
}

export interface AhCounterReportData {
  people: AhCounterPerson[];
}

export type RoleReportData =
  | TimerReportData
  | GrammarianReportData
  | AhCounterReportData;

export const createEmptyTimerPerson = (): TimerPerson => ({
  name: "",
  time: 0,
});

export const createEmptyGrammarianPerson = (): GrammarianPerson => ({
  name: "",
  highlights: "",
  improvement: "",
});

export const createEmptyAhCounterPerson = (): AhCounterPerson => ({
  name: "",
  uh: 0,
  um: 0,
  so: 0,
  uk: 0,
  other: 0,
});
