import { PostData } from "@/lib/service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { purchaseId, tx, contractPK } = await req.json();

  if (!purchaseId) {
    return Response.error();
  }

  const res = await PostData(`/admin/deploy/${purchaseId}`, {
    transactionHash: tx,
    contractAddress: contractPK,
  });

  if (res.error) {
    return Response.error();
  }

  return Response.json({
    saved: true,
  });
}
