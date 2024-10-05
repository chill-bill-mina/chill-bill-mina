import { NextRequest } from "next/server";

import { FetchData } from "@/lib/service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const product_id = searchParams.get("product_id");

  const res = await FetchData(`/user/products/${product_id}`);

  if (res.error) {
    return Response.error();
  }

  return Response.json(res.data);
}
