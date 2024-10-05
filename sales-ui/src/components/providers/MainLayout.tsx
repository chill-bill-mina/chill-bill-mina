import { useEffect } from "react";
import { Header } from "../Header";
import { useAppDispatch } from "@/types/state";
import { setSession } from "@/redux/session/slice";

export const MainLayout = ({
  children,
  publicKey,
}: {
  children: React.ReactNode;
  publicKey?: string;
}) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (publicKey) {
      dispatch(setSession(publicKey));
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
