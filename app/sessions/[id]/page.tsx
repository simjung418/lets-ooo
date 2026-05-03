import SessionClient from "@/component/SessionClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <SessionClient id={id} />;
}
