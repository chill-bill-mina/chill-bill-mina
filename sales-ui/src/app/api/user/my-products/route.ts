import { FetchData } from "@/lib/service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return Response.error();
  }
  const res = await FetchData("/user/my-products", token, true);

  if (res.error) {
    return Response.error();
  }

  return Response.json({
    products: res.data,
  });
}
