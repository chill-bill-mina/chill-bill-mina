import { PostData } from "@/lib/service";

export async function POST(req: Request) {
  const { publicKey, signature } = await req.json();

  const res = await PostData("/admin/verify", {
    address: publicKey,
    signature,
  });

  console.log("res", res);

  if (res.error) {
    return Response.error();
  }

  return Response.json(res.data);
}
