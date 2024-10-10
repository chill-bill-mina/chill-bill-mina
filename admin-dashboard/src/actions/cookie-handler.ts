"use server";

import { cookies } from "next/headers";

export async function setCookiePublicKey(publicKey: string) {
  cookies().set({
    name: "publicKeyAdmin",
    value: publicKey,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    sameSite: "lax",
    secure: true,
  });
}

export async function removeCookiePublicKey() {
  cookies().delete("publicKeyAdmin");
}

export async function getCookiePublicKey() {
  return cookies().get("publicKeyAdmin");
}

export async function setCookieToken(token: string) {
  cookies().set({
    name: "tokenAdmin",
    value: token,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    sameSite: "lax",
    secure: true,
  });
}

export async function removeCookieToken() {
  cookies().delete("tokenAdmin");
}

export async function getCookieToken() {
  return cookies().get("tokenAdmin");
}
