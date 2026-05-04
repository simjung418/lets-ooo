"use client";
import { getSessionWeight } from "@/app/utils";
import { DailySession } from "@/lib/types";

type Prop = {
  session: DailySession;
};
const getRandom = (max: number) => {
  return Math.floor(Math.random() * max);
};
export default function SessionCompleteSummary({ session }: Prop) {
  const text = ["오늘도 해냈어요!", "짱이에요 우히히", "운동이 끝났어요!", "오늘도 운동 완료!", "목표달성!"];
  const workoutCount = session.workout.length;
  const setCount = session.workout.reduce((sum, workout) => sum + workout.sets.length, 0);
  const createdAt = new Date(session.createdAt!);
  const completedAt = new Date(session.completedAt!);
  const diffMSec = completedAt.getTime() - createdAt.getTime();
  const diffMin = Math.floor(diffMSec / (60 * 1000));
  const getPreviousSamePartSession = (currentSession: DailySession) => {
    const asis = localStorage.getItem("OooData");
    const data = asis ? JSON.parse(asis) : null;
    if (!data) return;
    return data
      .filter((session: DailySession) => {
        return session.id !== currentSession.id && session.exercisePart === currentSession.exercisePart && session.date < currentSession.date;
      })
      .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date))[0];
  };
  const currentVolume = getSessionWeight(session); // 지금 볼륨
  const prevSession = getPreviousSamePartSession(session); // 이전 같은부위 운동
  const prevVolume = prevSession ? getSessionWeight(prevSession) : null; // 이전 볼륨
  const volumeDiff = prevVolume !== null ? currentVolume - prevVolume : null; // 볼륨 차이
  const volumeDiffRate = prevVolume && prevVolume > 0 ? ((currentVolume - prevVolume) / prevVolume) * 100 : null; // 볼륨 차이 퍼센트
  return (
    <div className="flex flex-col items-center gap-4 [&_p]:text-center [&_span]:font-semibold [&_span]:text-green-500">
      <h2 className="text-2xl font-bold text-green-500">{text[getRandom(5)]}</h2>
      <div></div>
      <p>
        총 <span>{diffMin}분</span> 운동했어요.
      </p>
      <p>
        <span>{workoutCount}</span>개의 운동으로
        <br />총 <span>{getSessionWeight(session)}kg</span>을 들었네요!
      </p>
      {prevSession && (
        <p>
          이전 {session.exercisePart} 운동 대비{" "}
          <span>
            {volumeDiff! > 0 ? "+" : ""}
            {volumeDiff}kg ({volumeDiffRate?.toFixed(1)}%)
          </span>
        </p>
      )}
    </div>
  );
}
