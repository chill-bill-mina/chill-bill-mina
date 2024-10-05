"use server";

import { cookies } from "next/headers";

export async function setCookiePublicKey(publicKey: string) {
  cookies().set({
    name: "publicKey",
    value: publicKey,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    sameSite: "lax",
    secure: true,
  });
}

export async function removeCookiePublicKey() {
  cookies().delete("publicKey");
}

export async function getCookiePublicKey() {
  return cookies().get("publicKey");
}

export async function setCookieToken(token: string) {
  cookies().set({
    name: "token",
    value: token,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    sameSite: "lax",
    secure: true,
  });
}

export async function removeCookieToken() {
  cookies().delete("token");
}

export async function getCookieToken() {
  return cookies().get("token");
}
