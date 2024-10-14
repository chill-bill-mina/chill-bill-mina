import { PostData } from "@/lib/service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { purchaseId, tx } = await req.json();

  if (!purchaseId) {
    return Response.error();
  }

  const res = await PostData(`/admin/initialize/${purchaseId}`, {
    transactionHash: tx,
  });

  if (res.error) {
    return Response.error();
  }

  return Response.json({
    saved: true,
  });
}
