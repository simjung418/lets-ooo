import SessionChart from "./SessionChart";
import SessionCalender from "./SessionCalender";

export default function SessionListClient() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <SessionCalender />
      <SessionChart />
    </div>
  );
}
