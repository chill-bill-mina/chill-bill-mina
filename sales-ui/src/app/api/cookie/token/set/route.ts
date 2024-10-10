import { setCookieToken } from "@/actions/cookie-handler";

export async function POST(req: Request) {
  const { token } = await req.json();

  let res;

  try {
    await setCookieToken(token);
    res = {
      data: {
        token: token,
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
