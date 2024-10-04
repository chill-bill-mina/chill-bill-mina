import { FetchData } from "@/lib/service";

export async function GET() {
  const res = await FetchData("/user/products");

  if (res.error) {
    return Response.error();
  }

  return Response.json({
    products: res.data,
  });
}
