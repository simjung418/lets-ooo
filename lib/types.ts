export type SessionList = DailySession[];

export type DailySession = {
  id: string;
  date: string;
  exercisePart: string;
  workout: Workout[];
};

export type Workout = {
  id: string,
  exerciseName: string;
  sets: SetRecord[];
};

export type SetRecord = { weight: number; reps: number };
