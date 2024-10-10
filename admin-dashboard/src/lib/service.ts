/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from "./constant";

export const FetchData = async (
  endpoint: string,
  token?: string,
  auth?: boolean
) => {
  try {
    let res;
    if (!!auth) {
      res = await fetch(API_URL + endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      res = await fetch(API_URL + endpoint, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const data = await res.json();

    return {
      data,
      status: res.status,
    };
  } catch (error) {
    console.error(error);
    return {
      error,
      status: 500,
    };
  }
};

export const PostData = async (endpoint: string, body: any) => {
  try {
    const res = await fetch(API_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return {
      data,
      status: res.status,
    };
  } catch (error) {
    console.error(error);
    return {
      error,
      status: 500,
    };
  }
};
