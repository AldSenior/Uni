import dynamic from "next/dynamic";

const VKCallback = dynamic(() => import("../components/VKCallback"), {
  ssr: false,
});

export default function Page() {
  return <VKCallback />;
}
