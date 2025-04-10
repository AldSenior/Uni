"use client";
import dynamic from "next/dynamic";

const Messenger = dynamic(() => import("../components/Messenger"), {
  ssr: false,
});

export default function MessagesPage() {
  return <Messenger />;
}
