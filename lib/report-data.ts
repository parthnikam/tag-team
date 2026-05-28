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

export interface GrammarianImproperUseEntry {
  id?: string;
  name: string;
  whatWasSaid: string;
  suggestion: string;
}

export interface GrammarianNotablePhraseEntry {
  id?: string;
  name: string;
  phrase: string;
  meaning?: string;
}

export interface GrammarianReportData {
  wod: string;
  meaning: string;
  improperUseEntries: GrammarianImproperUseEntry[];
  notablePhraseEntries: GrammarianNotablePhraseEntry[];
}

export interface AhCounterPerson {
  name: string;
  ah: number;
  um: number;
  er: number;
  well: number;
  so: number;
  like: number;
  but: number;
  youknow: number;
  and: number;
  customWords?: Record<string, number>;
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
  ah: 0,
  um: 0,
  er: 0,
  well: 0,
  so: 0,
  like: 0,
  but: 0,
  youknow: 0,
  and: 0,
  customWords: {},
});
