import { removeCookiePublicKey } from "@/actions/cookie-handler";

export async function GET() {
  let res;

  try {
    await removeCookiePublicKey();
    res = {
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
