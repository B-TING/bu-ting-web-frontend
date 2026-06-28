export type CompanionRole = '방장' | '편집' | '보기';

export interface Companion {
  id: string;
  name: string;
  role: CompanionRole;
  initial: string;
  color: string;
}

export interface DayHighlight {
  day: number;
  date: string;
  dayOfWeek: string;
  places: string[];
}

export interface NextSchedule {
  place: string;
  day: number;
  date: string;
  dayOfWeek: string;
}
