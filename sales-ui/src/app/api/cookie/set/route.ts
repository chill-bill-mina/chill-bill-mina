import { setCookie } from "../../../../actions/cookie-handler";

export async function POST(req: Request) {
  const { publicKey } = await req.json();

  let res;

  try {
    await setCookie(publicKey);
    res = {
      data: {
        publicKey: publicKey,
      },
      status: 200,
    };
  } catch (error) {
    res = {
      data: {
        error: error,
      },
      status: 500,
    };
  }

  return Response.json(res);
}
