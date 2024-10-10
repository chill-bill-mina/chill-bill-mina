import { useEffect } from "react";
import { Header } from "../Header";
import { useAppDispatch } from "@/types/state";
import { setSession, setToken } from "@/redux/session/slice";
import {
  deletePublicKeyCookie,
  deletePublicKeyToken,
} from "@/redux/session/thunk";
import { useRouter } from "next/navigation";

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

  const router = useRouter();
  useEffect(() => {
    if (publicKey) {
      dispatch(setSession(publicKey));
    }
    if (token) {
      dispatch(setToken(token));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mina = (window as any).mina;

    if (mina == null) {
      return;
    }
    mina?.on("accountsChanged", (accounts: string[]) => {
      dispatch(deletePublicKeyCookie());
      dispatch(deletePublicKeyToken());
      router.push("/home");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Header />
      {children}
    </div>
  );
};
