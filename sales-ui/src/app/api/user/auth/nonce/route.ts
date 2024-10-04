import { PostData } from "@/lib/service";

export async function POST(req: Request) {
  const { publicKey } = await req.json();

  const res = await PostData("/user/nonce", {
    address: publicKey,
  });

  if (res.error) {
    return Response.error();
  }

  return Response.json(res.data);
}
