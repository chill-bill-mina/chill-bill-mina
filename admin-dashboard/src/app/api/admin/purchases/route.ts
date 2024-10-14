/* eslint-disable @typescript-eslint/no-explicit-any */
import { FetchData } from "@/lib/service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return Response.error();
  }
  const res = await FetchData("/admin/pending-purchases", token, true);

  const purchases = res.data.map((purchase: any) => {
    const saleDate = new Date(purchase.saleDate);
    const formattedDate = parseInt(
      saleDate.getFullYear().toString() +
        (saleDate.getMonth() + 1).toString().padStart(2, "0") +
        saleDate.getDate().toString().padStart(2, "0")
    );
    return {
      ...purchase,
      invoiceNumber: 0,
      productDescription: "description",
      saleDateNum: formattedDate,
    };
  });

  if (res.error) {
    return Response.error();
  }

  return Response.json({
    purchases,
  });
}
