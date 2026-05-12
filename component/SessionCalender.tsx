"use client";

import { dummy } from "@/app/dummy";
import { createEmptySession } from "@/app/utils";
import { DailySession, SessionList } from "@/lib/types";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, EllipsisHorizontalCircleIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 1. 이번 달의 첫날 구하기
// 2. 이번 달의 마지막 날짜 구하기
// 3. 앞쪽 빈칸 채우기
// 4. 날짜 배열 map
// 5. calendarMap[dateKey] 있으면 운동 정보 표시

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const targetDate = new Date(2026, 3, 1); // 2026-04-01
// const targetDate = new Date(); // 금일
const yearofNow = targetDate.getFullYear();
const monthofNow = targetDate.getMonth();

export default function SessionCalender() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(yearofNow);
  const [selectedMonth, setSelectedMonth] = useState(monthofNow);
  const [selected, setSelected] = useState("");
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const lastDate = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const weeksofMonth = Math.ceil((lastDate + firstDay) / 7);
  const [sessionList, setSessionList] = useState<SessionList>(() => {
    const local = localStorage.getItem("OooData");
    return local && local !== undefined ? JSON.parse(local) : dummy;
  });
  const selectedList = () => {
    if (!selected) return;
    return sessionList.find((session) => session.id === selected);
  };
  const calendarMap = useMemo(() => {
    return sessionList.reduce(
      (acc, cur) => {
        if (!acc[cur.date])
          acc = {
            ...acc,
            [cur.date]: cur,
          };
        return acc;
      },
      {} as Record<string, DailySession>
    );
  }, [sessionList]);
  const handleCalenderMonth = (value: "prev" | "next") => {
    setSelected("");
    if (value === "prev") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear((prev) => prev - 1);
        return;
      }

      setSelectedMonth((prev) => prev - 1);
      return;
    }

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
      return;
    }

    setSelectedMonth((prev) => prev + 1);
  };
  const handleAddSession = (date: string) => {
    const newSession = createEmptySession(date);
    setSessionList((prev: SessionList) => [newSession, ...prev]);
    router.push(`/sessions/${newSession.id}`)
  };
  const handleDeleteSession = (id: string) => {
    if (confirm("정말로 이 세션을 삭제할까요?")) {
      setSessionList((prev: SessionList) => prev.filter((item: DailySession) => item.id !== id));
    }
  };
  useEffect(() => {
    if (!sessionList) return;
    localStorage.setItem(`OooData`, JSON.stringify(sessionList));
  }, [sessionList]);

  return (
    <div className="flex flex-col items-center">
      <div className="my-4 flex items-center gap-3">
        <button onClick={() => handleCalenderMonth("prev")}>
          <ChevronLeftIcon className="size-10 text-zinc-500 sm:size-5" />
        </button>
        <h2 className="text-3xl font-bold sm:text-xl">{selectedMonth + 1}월의 운동기록</h2>
        <button onClick={() => handleCalenderMonth("next")}>
          <ChevronRightIcon className="size-10 text-zinc-500 sm:size-5" />
        </button>
      </div>
      <dl className="grid w-full grid-cols-7 [&_dd]:border [&_dd]:border-zinc-200 [&_dd]:p-2 [&_dt]:border [&_dt]:border-zinc-200 [&_dt]:p-2">
        {days.map((day) => (
          <dt key={day} className="text-center text-zinc-400">
            {day}
          </dt>
        ))}
        {Array.from({ length: weeksofMonth }, (_, week) => (
          <Fragment key={`${selectedMonth}-${week}`}>
            {Array.from({ length: 7 }, (__, idx) => {
              const date = week * 7 + idx - firstDay + 1;
              if (date <= 0) {
                return <dd key={`${selectedMonth}-${week}-${idx}`} />;
              }
              if (date > lastDate) {
                return <dd key={`${selectedMonth}-${week}-${idx}`} />;
              }

              const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

              const sessions = calendarMap[dateKey];
              return (
                <dd
                  key={`${week}-${idx}`}
                  className={clsx("flex h-20 flex-col gap-2 border p-2 sm:min-h-30", !sessions && "items-center justify-center")}
                >
                  {sessions ? (
                    <Fragment>
                      <Link href={`/sessions/${sessions.id}`} className="hidden sm:block">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-zinc-900">
                            {date} {sessions.exercisePart}운동
                          </p>
                          <button
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteSession(sessions.id);
                            }}
                          >
                            <TrashIcon className="size-4 text-red-400" />
                          </button>
                        </div>
                        <ul>
                          {sessions.workout.slice(0, 2).map((w, i) => (
                            <li key={i} className="text-sm">
                              {w.exerciseName}
                            </li>
                          ))}
                          {sessions.workout.length > 2 && <li>...</li>}
                        </ul>
                      </Link>
                      <button
                        onClick={() => setSelected(sessions.id)}
                        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 sm:hidden"
                      >
                        <p className="self-start font-semibold text-zinc-900">{date}</p>
                        <div className="flex flex-1 items-center justify-center">
                          <EllipsisHorizontalCircleIcon className="size-5 text-zinc-400" />
                        </div>
                      </button>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <p className="self-start text-zinc-400">{date}</p>
                      <button className="flex-1 cursor-pointer" onClick={() => handleAddSession(dateKey)}>
                        <PlusIcon className="size-5 text-zinc-400" />
                      </button>
                    </Fragment>
                  )}
                </dd>
              );
            })}
          </Fragment>
        ))}
      </dl>
      {selected && (
        <Link href={`/sessions/${selected}`} className="mt-4 flex w-8/10 items-center justify-between rounded border border-zinc-100 p-2 sm:hidden">
          <div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-zinc-900">
                {selectedList()!.date}의 {selectedList()!.exercisePart}운동
              </p>
              {/* <button
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteSession(selectedList()!.id);
                }}
              >
                <TrashIcon className="size-4 text-red-400" />
              </button> */}
            </div>
            <ul>
              {selectedList()!
                .workout.slice(0, 2)
                .map((w, i) => (
                  <li key={i} className="text-sm">
                    {w.exerciseName}
                  </li>
                ))}
              {selectedList()!.workout.length > 2 && <li>...</li>}
            </ul>
          </div>
          <div className="flex items-center gap-2">
            {selectedList()!.workout.length < 1 ? (
              <>  
              <p className="text-sm text-green-500 font-bold">운동시작</p>
              <ArrowRightIcon className="size-4 text-green-500" />
              </>
            ) : (
              <>
              <p className="text-sm text-zinc-600">보러가기</p>
              <ArrowRightIcon className="size-4 text-zinc-400" />
              </>
            )}
          </div>
        </Link>
      )}
    </div>
  );
}
