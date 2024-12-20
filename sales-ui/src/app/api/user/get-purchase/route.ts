import { NextRequest } from "next/server";

import { FetchData } from "@/lib/service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const purchaseId = searchParams.get("purchase_id");

  const res = await FetchData(`/user/get-purchase/${purchaseId}`);

  if (res.error) {
    return Response.error();
  }

  return Response.json(res.data);
}
