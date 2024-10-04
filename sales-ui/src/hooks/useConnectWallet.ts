/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/types/state";
import { setPublicKeyCookie } from "@/redux/session/thunk";
import { useQuery } from "./useQuery";

export type SignMessageArgs = {
  message: string;
};

export interface SignedData {
  publicKey: string;
  data: string;
  signature: {
    field: string;
    scalar: string;
  };
}

interface ProviderError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export const useConnectWallet = () => {
  const [signRes, setSignRes] = useState<SignedData | ProviderError | null>(
    null
  );

  const { data, postData } = useQuery<{
    nonce: number;
  }>();

  const publicKeyBase58 = useAppSelector(
    (state) => state.session.publicKeyBase58
  );

  const dispatch = useAppDispatch();

  const handleConnectWallet = () => {
    (async () => {
      const mina = (window as any).mina;

      if (mina == null) {
        return;
      }

      const valuePublicKeyBase58: string = (await mina.requestAccounts())[0];

      console.log(`Using key:${valuePublicKeyBase58}`);

      dispatch(
        setPublicKeyCookie({
          publicKeyBase58: valuePublicKeyBase58,
        })
      );

      getNonce(valuePublicKeyBase58);
    })();
  };

  const getNonce = (valuePublicKeyBase58: string) => {
    postData("/api/user/auth/nonce", { publicKey: valuePublicKeyBase58 }).then(
      () => {
        signMessage(data?.nonce.toString() ?? "");
      }
    );
  };

  const signMessage = (message: string) => {
    (async () => {
      const mina = (window as any).mina;

      if (mina == null) {
        return;
      }

      const signContent: SignMessageArgs = {
        message,
      };

      const signResult: SignedData | ProviderError = await mina
        ?.signMessage(signContent)
        .catch((err: any) => err);

      //TODO: verify endpoint doesnt work
      // postData("/api/user/auth/verify", {
      //         publicKey: (signRes as SignedData)?.publicKey,
      //         signature: (signRes as SignedData)?.signature,
      //       });

      setSignRes(signResult);
    })();
  };

  return { signRes, publicKeyBase58, handleConnectWallet, signMessage };
};
