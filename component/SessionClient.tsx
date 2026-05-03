"use client";
import dynamic from "next/dynamic";

const SessionEdit = dynamic(() => import("../component/SessionEdit"), {
  ssr: false,
});

type Prop = {
  id: string;
};

export default function Page({ id }: Prop) {
  return <SessionEdit sessionId={id} />;
}
