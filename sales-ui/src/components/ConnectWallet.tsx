import Image from "next/image";

import AuroSvg from "@/assets/svg/auro.svg";

export const ConnectWallet = () => {
  return (
    <button className="bg-connect-wallet px-4 py-3 flex items-center gap-x-3 rounded-lg">
      <Image src={AuroSvg} alt="Auro" />
      <span className="text-black text-2xl">Connect Wallet</span>
    </button>
  );
};
