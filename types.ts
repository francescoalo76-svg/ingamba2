export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
}

export interface Team {
  id: string;
  name: string;
  athleteIds: string[];
}

export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  teamId: string; // Simplified to one team per event for this version
}

export enum AttendanceStatus {
  Present = 'Presente',
  Absent = 'Assente',
}

export interface AttendanceRecord {
  eventId: string;
  athleteId: string;
  status: AttendanceStatus;
  notes?: string;
}

export type View = 'calendar' | 'teams' | 'athletes' | 'settings';