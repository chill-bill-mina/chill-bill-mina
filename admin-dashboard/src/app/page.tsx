import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  const token = cookies().get("tokenAdmin");

  if (!!token) {
    redirect("/purchases");
  }
  return <div className=""></div>;
}
