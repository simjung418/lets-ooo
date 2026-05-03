"use client";

import { DailySession, SessionList } from "@/lib/types";
import { Fragment, useEffect, useRef, useState } from "react";
import { dummy } from "../app/dummy";
import { TrashIcon, PlusIcon, MinusIcon, PencilSquareIcon, ArrowLeftIcon, CheckIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { normalizeNumberInput, getSessionWeight } from "@/app/utils";

type Prop = {
  sessionId: string;
};

export default function SessionEdit({ sessionId }: Prop) {
  const router = useRouter();
  const [session, setSession] = useState<DailySession | null>(() => {
    const local = localStorage.getItem(`OooData`);
    const data = local ? (JSON.parse(local) as SessionList) : dummy;
    const thisSession = data.find((item: DailySession) => item.id === sessionId);
    return thisSession ?? null;
  });
  const [exerciseName, setExerciseName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const pendingFocusNameRef = useRef<string | null>(null);
  useEffect(() => {
    if (!session) router.push("/");
  }, [session, router]);
  useEffect(() => {
    if (!session) return;
    const asis = localStorage.getItem("OooData");
    const data = asis ? JSON.parse(asis) : null;
    if (!data) return;
    const tobe = data?.map((item: DailySession) => {
      if (item.id !== sessionId) return item;
      return session;
    });
    localStorage.setItem(`OooData`, JSON.stringify(tobe));
  }, [session, sessionId]);

  if (!session) {
    return <div>잘못된 운동세션입니다. 리스트로 돌아갑니다...</div>;
  }

  const EXERCISE_PART_OPTIONS = ["등", "가슴", "하체", "어깨", "팔", "전신"];
  const maxSetLength = Math.max(0, ...session.workout.map((item) => item.sets.length));
  const handleDeleteSession = () => {
    if (!confirm("정말로 이 세션을 삭제할까요?")) return;
    const asis = localStorage.getItem("OooData");
    const data = asis ? (JSON.parse(asis) as SessionList) : [];
    const tobe = data.filter((item: DailySession) => item.id !== sessionId);

    localStorage.setItem("OooData", JSON.stringify(tobe));
    setSession(null);
    router.replace("/");
  };
  const updateSession = (updater: (session: DailySession) => DailySession) => {
    setSession((prev) => {
      if (!prev) return prev;
      return updater(prev);
    });
  };
  const handleAddWorkout = () => {
    if (!exerciseName.trim()) return;
    updateSession((prev) => ({
      ...prev,
      workout: [
        ...prev.workout,
        {
          id: crypto.randomUUID(),
          exerciseName,
          sets: [
            {
              weight: 0,
              reps: 0,
            },
          ],
        },
      ],
    }));
    setExerciseName("");
  };
  const handleChangeWorkout = (id: string, value: string) => {
    updateSession((prev) => ({
      ...prev,
      workout: prev.workout.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          exerciseName: value,
        };
      }),
    }));
  };
  const handleDeleteWorkout = (id: string) => {
    if (!confirm("정말로 운동을 삭제하시겠어요?")) return;
    updateSession((prev) => ({
      ...prev,
      workout: prev.workout.filter((item) => item.id !== id),
    }));
  };
  const handleAddSet = (id: string) => {
    updateSession((prev) => ({
      ...prev,
      workout: prev.workout.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          sets: [
            ...item.sets,
            {
              weight: 0,
              reps: 0,
            },
          ],
        };
      }),
    }));
  };
  const handleChangeSet = (id: string, idx: number, field: "weight" | "reps", value: number) => {
    updateSession((prev) => ({
      ...prev,
      workout: prev.workout.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          sets: item.sets.map((set, index) => {
            if (index !== idx) return set;
            return {
              ...set,
              [field]: normalizeNumberInput(value),
            };
          }),
        };
      }),
    }));
  };

  const handleChangeWeightInput = (id: string, idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizeNumberInput(Number(e.target.value));
    e.currentTarget.value = String(value);
    handleChangeSet(id, idx, "weight", value);
  };

  const handleChangeRepsInput = (id: string, idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizeNumberInput(e.target.value === "" ? 0 : Number(e.target.value));
    e.currentTarget.value = value === 0 ? "" : String(value);
    handleChangeSet(id, idx, "reps", value);
  };

  const handleDeleteSet = (id: string, idx: number) => {
    updateSession((prev) => ({
      ...prev,
      workout: prev.workout.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          sets: item.sets.filter((_, index) => index !== idx),
        };
      }),
    }));
  };
  const registerInputRef = (name: string) => (element: HTMLInputElement | null) => {
    if (!element) return;

    if (pendingFocusNameRef.current === name) {
      element.focus();
      pendingFocusNameRef.current = null;
    }
  };

  const focusNextInput = (
    e: React.KeyboardEvent<HTMLInputElement>,
    workoutId: string,
    setIndex: number,
    field: "weight" | "reps",
    setsLength: number
  ) => {
    if (e.key !== "Enter" && e.key !== "Tab") return;
    if (e.shiftKey) return;
    e.preventDefault();

    const isLastRepsInput = field === "reps" && setIndex === setsLength - 1;

    if (isLastRepsInput && e.key === "Enter") {
      pendingFocusNameRef.current = `${workoutId}-sets-${setIndex + 1}-weight`;
      handleAddSet(workoutId);
      return;
    }

    const current = e.currentTarget;
    const table = current.closest("table");
    if (!table) return;

    const inputs = Array.from(table.querySelectorAll<HTMLInputElement>(`input[name*="sets"]`));
    const currentIndex = inputs.indexOf(current);
    const nextInput = inputs[currentIndex + 1];

    nextInput?.focus();
  };

  return (
    <div className="mx-auto w-[calc(100%-16px)]">
      <div className="mx-auto sm:max-w-4xl">
        <button onClick={() => router.push("/")} className="mt-5 flex items-center gap-1">
          <ArrowLeftIcon className="size-4" />
          리스트로 돌아가기
        </button>
        {isEdit ? (
          <div className="mt-2 flex w-full flex-col gap-6 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4">
              <p className="flex items-center gap-2">
                <label htmlFor="sessionDate" className="inline-block w-16 text-right font-medium text-zinc-600">
                  날짜
                </label>
                <input
                  type="date"
                  value={session.date}
                  name="sessionDate"
                  className="h-8 flex-1 rounded border border-zinc-400 px-1 sm:h-7"
                  onChange={(e) => updateSession((prev) => ({ ...prev, date: e.target.value }))}
                />
              </p>
              <p className="flex items-center gap-2">
                <label htmlFor="sessionExercisePart" className="inline-block w-16 text-right font-medium text-zinc-600">
                  운동부위
                </label>
                <select
                  name="sessionExercisePart"
                  id="sessionExercisePart"
                  value={session.exercisePart}
                  onChange={(e) => updateSession((prev) => ({ ...prev, exercisePart: e.target.value }))}
                  className="h-8 flex-1 rounded border border-zinc-400 sm:h-7 sm:w-37"
                >
                  {EXERCISE_PART_OPTIONS.map((part) => (
                    <option key={`exercise-option-${part}`} value={part} className="font-base">
                      {part}
                    </option>
                  ))}
                </select>
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                onClick={() => setIsEdit(false)}
                className="flex w-full items-center justify-center gap-2 rounded border border-green-400 px-2 py-1"
              >
                <p className="text-green-500">수정완료</p>
                <CheckIcon className="size-5 text-green-400" />
              </button>
              <button
                onClick={() => handleDeleteSession()}
                className="flex w-full items-center justify-center gap-2 rounded border border-red-500 px-2 py-1"
              >
                <p className="text-red-500">세션삭제</p>
                <TrashIcon className="size-5 text-red-500" />
              </button>
            </div>
          </div>
        ) : (
          <div className="my-2 flex items-center justify-between gap-2 sm:my-4 sm:justify-start">
            <h2 className="text-xl font-bold">
              {session.date}의 {session.exercisePart}운동
            </h2>
            <button onClick={() => setIsEdit(true)} className="flex items-center gap-1 text-zinc-400">
              <p className="block text-sm sm:hidden">수정하기</p>
              <PencilSquareIcon className="size-5" />
            </button>
          </div>
        )}
      </div>

      {session.workout.length !== 0 ? (
        <div>
          <div className="overflow-x-scroll">
            <table className="mt-4 sm:mx-auto [&_td]:border [&_td_input]:box-border [&_td_input]:px-1 [&_td_input]:py-2 [&_th]:border [&_th]:p-2">
              <thead>
                <tr>
                  <th rowSpan={2}></th>
                  {Array.from({ length: maxSetLength }, (_, idx) => (
                    <th key={`set-th-${idx}`} colSpan={3}>
                      {idx + 1}set
                    </th>
                  ))}
                  <th rowSpan={2}>
                    <p className="hidden sm:block">세트추가</p>
                    <p className="block sm:hidden">세트</p>
                  </th>
                  <th rowSpan={2}>총 볼륨</th>
                  <th rowSpan={2}>삭제</th>
                </tr>
                <tr>
                  {Array.from({ length: maxSetLength }, (_, idx) => (
                    <Fragment key={`sets-${idx}-th`}>
                      <th className="text-xs sm:text-base">wght</th>
                      <th className="text-xs sm:text-base">reps</th>
                      <th>
                        <div className="w-4"></div>
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {session.workout.map((item, index) => {
                  const totalWeight = item.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
                  return (
                    <tr key={`${item.id}-${index}`}>
                      <td className="px-1 text-nowrap">
                        {/* {item.exerciseName} */}
                        {
                          <input
                            type="text"
                            name={`${item.id}-${item.exerciseName}`}
                            value={item.exerciseName}
                            onChange={(e) => handleChangeWorkout(item.id, e.target.value)}
                          />
                        }
                      </td>
                      {Array.from({ length: maxSetLength }, (_, idx) => {
                        const set = item.sets[idx];
                        return (
                          <Fragment key={`${item.id}-sets-${idx}-td`}>
                            {set ? (
                              <>
                                <td className="text-center">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    name={`${item.id}-sets-${idx}-weight`}
                                    value={set.weight}
                                    onChange={(e) => handleChangeWeightInput(item.id, idx, e)}
                                    ref={registerInputRef(`${item.id}-sets-${idx}-weight`)}
                                    onKeyDown={(e) => focusNextInput(e, item.id, idx, "weight", item.sets.length)}
                                    className="w-full text-center sm:w-12"
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    name={`${item.id}-sets-${idx}-reps`}
                                    value={set.reps === 0 ? "" : set.reps}
                                    onChange={(e) => handleChangeRepsInput(item.id, idx, e)}
                                    ref={registerInputRef(`${item.id}-sets-${idx}-reps`)}
                                    onKeyDown={(e) => focusNextInput(e, item.id, idx, "reps", item.sets.length)}
                                    className="w-full text-center sm:w-12"
                                  />
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleDeleteSet(item.id, idx)}
                                    className="flex h-full w-full cursor-pointer items-center justify-center"
                                  >
                                    <MinusIcon className="size-4" />
                                  </button>
                                </td>
                              </>
                            ) : (
                              <td colSpan={3}></td>
                            )}
                          </Fragment>
                        );
                      })}
                      <td className="p-0! text-center">
                        <button
                          className="flex aspect-square h-8 cursor-pointer items-center justify-center text-green-500 sm:mx-auto sm:h-full sm:w-full"
                          onClick={() => handleAddSet(item.id)}
                        >
                          <PlusIcon className="size-5" />
                        </button>
                      </td>
                      <td className="p-2">{totalWeight}kg</td>
                      <td className="p-0! text-center">
                        <button
                          className="item-center mx-auto flex h-full w-full cursor-pointer justify-center"
                          onClick={() => handleDeleteWorkout(item.id)}
                        >
                          <TrashIcon className="size-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr className="hidden sm:table-row">
                  <td className="px-1">
                    <label htmlFor="exerciseName" className="w-16 text-right">
                      운동추가
                    </label>
                  </td>
                  <td colSpan={maxSetLength * 3 + 1} className="p-1">
                    <p className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exerciseName}
                        name="exerciseName"
                        onChange={(e) => setExerciseName(e.target.value)}
                        className="h-8 rounded border px-1 sm:h-7"
                        onKeyUp={(e) => {
                          if (e.key === "Enter") handleAddWorkout();
                        }}
                      />
                      <button onClick={() => handleAddWorkout()} className="flex size-6 items-center justify-center rounded border text-green-500">
                        <PlusIcon className="size-3" />
                      </button>
                    </p>
                  </td>
                  <td>{getSessionWeight(session)}kg</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:hidden">
            <input
              type="text"
              value={exerciseName}
              name="exerciseName"
              onChange={(e) => setExerciseName(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") handleAddWorkout();
              }}
              placeholder="운동을 추가해보세요."
              className="h-10 w-full rounded border border-zinc-300 px-2 sm:w-auto"
            />
            <button
              onClick={() => handleAddWorkout()}
              className="flex h-10 items-center justify-center rounded border border-green-500 text-lg font-bold text-green-500"
            >
              운동추가
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto sm:my-10 flex flex-col gap-2 sm:max-w-4xl sm:w-fit">
          <p className="text-2xl font-bold">오늘의 운동을 추가해보세요!</p>
          <p></p>
          <p>
            <input
              type="text"
              value={exerciseName}
              name="exerciseName"
              onChange={(e) => setExerciseName(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") handleAddWorkout();
              }}
              placeholder="여기에 첫 운동을 입력해보세요."
              className="block h-10 w-full rounded px-2 ring-1 sm:w-sm"
            />
          </p>
          <button
            onClick={() => handleAddWorkout()}
            className="flex h-10 w-full items-center justify-center rounded border border-green-500 text-lg font-bold text-green-500 sm:w-sm"
          >
            운동추가
          </button>
        </div>
      )}
    </div>
  );
}
