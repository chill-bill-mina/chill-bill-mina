import { API_URL } from "./constant";

export const FetchData = async (endpoint: string) => {
  console.log("service endpoint", API_URL + endpoint);
  try {
    const res = await fetch(API_URL + endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
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
