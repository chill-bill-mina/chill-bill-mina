import { PostData } from "@/lib/service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { productId, token } = await req.json();

  if (!token) {
    return Response.error();
  }
  const res = await PostData(
    "/user/buy",
    {
      productId,
      ownerName: "Kerem Kaya",
      email: "kerem@gmail.com",
      phoneNumber: "555 555 55 55 ",
      quantity: 1,
    },
    token,
    true
  );

  if (res.error) {
    return Response.error();
  }

  return Response.json(res.data);
}
