import { useEffect } from "react";
import { Header } from "../Header";
import { useAppDispatch } from "@/types/state";
import { setSession, setToken } from "@/redux/session/slice";

export const MainLayout = ({
  children,
  publicKey,
  token,
}: {
  children: React.ReactNode;
  publicKey?: string;
  token?: string;
}) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (publicKey) {
      dispatch(setSession(publicKey));
    }
    if (token) {
      dispatch(setToken(token));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Header />
      {children}
    </div>
  );
};
