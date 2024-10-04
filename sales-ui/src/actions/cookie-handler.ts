"use server";

import { cookies } from "next/headers";

export async function setCookie(publicKey: string) {
  cookies().set({
    name: "publicKey",
    value: publicKey,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    sameSite: "lax",
    secure: true,
  });
}

export async function removeCookie() {
  cookies().delete("publicKey");
}

export async function getCookie() {
  return cookies().get("publicKey");
}
