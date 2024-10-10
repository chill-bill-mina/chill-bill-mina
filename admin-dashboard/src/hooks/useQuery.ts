/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

export const useQuery = <T>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const fetchData = async (url: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setData(data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const postData = async (url: string, body: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setData(data);
      return data;
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const putData = async (url: string, body: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setData(data);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, data, fetchData, postData, putData };
};
