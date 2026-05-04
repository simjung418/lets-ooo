import { DailySession } from "@/lib/types";

export const createEmptySession = (date: string): DailySession => ({
  id: crypto.randomUUID(),
  date: date,
  exercisePart: "",
  workout: [],
  createdAt: new Date(),
  completedAt: null
});

export const normalizeNumberInput = (value: number) => {
  const number = Number(value);
  if (Number.isNaN(number)) return 0;
  if (number < 0) return 0;
  return number;
};

export const getSessionWeight = (session: DailySession) => {
  return session.workout.reduce((sessionSum, workout) => {
    return (
      sessionSum +
      workout.sets.reduce((setSum, set) => {
        return setSum + set.weight * set.reps;
      }, 0)
    );
  }, 0);
};
