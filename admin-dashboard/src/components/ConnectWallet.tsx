/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Image from "next/image";

import AuroSvg from "@/assets/svg/auro.svg";
import { useConnectWallet } from "@/hooks/useConnectWallet";

export const ConnectWallet = () => {
  const { publicKeyBase58, handleConnectWallet } = useConnectWallet();

  const handleConnect = () => {
    handleConnectWallet();
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-connect-wallet bg-opacity-20 px-4 py-3 flex items-center gap-x-3 rounded-lg"
    >
      <Image src={AuroSvg} alt="Auro" />
      <span className="text-black text-2xl">
        {publicKeyBase58
          ? publicKeyBase58.slice(0, 5) + "..." + publicKeyBase58.slice(-5)
          : "Connect Wallet"}
      </span>
    </button>
  );
};
