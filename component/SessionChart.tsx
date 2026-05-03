import { dummy } from "@/app/dummy";
import { getSessionWeight } from "@/app/utils";
import { DailySession } from "@/lib/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { RechartsDevtools } from "@recharts/devtools";

export default function SessionChart() {
  const sessionList = () => {
    const local = localStorage.getItem("OooData");
    return (local ? JSON.parse(local) : dummy)
      .map((session: DailySession) => ({ date: session.date, weight: getSessionWeight(session), exercisePart: session.exercisePart }))
      .sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date));
  };
  return (
    <div style={{ width: "100%", height: 500 }} className="flex items-center justify-center">
      <AreaChart
        style={{ width: "100%", maxWidth: "700px", maxHeight: "70vh", aspectRatio: 1.618 }}
        responsive
        data={sessionList()}
        margin={{
          top: 20,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        onContextMenu={(_, e) => e.preventDefault()}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" niceTicks="snap125" />
        <YAxis width="auto" niceTicks="snap125" />
        <Tooltip />
        <Area type="monotone" dataKey="weight" name="총 볼륨" stroke="#8884d8" fill="#8884d8" />
        <RechartsDevtools />
      </AreaChart>
    </div>
  );
}
