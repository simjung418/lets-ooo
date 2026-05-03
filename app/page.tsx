"use client";
import dynamic from "next/dynamic";

const SessionList = dynamic(() => import("../component/SessionList"), {
  ssr: false,
});

export default function Page() {
  return <SessionList />;
}
