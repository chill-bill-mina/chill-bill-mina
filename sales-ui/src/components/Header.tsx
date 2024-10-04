import Image from "next/image";

import Logo from "@/assets/svg/logo.svg";
import SearchIcon from "@/assets/svg/search-icon.svg";
import { ConnectWallet } from "./ConnectWallet";

export const Header = () => {
  return (
    <div className="py-4 px-[50px] flex items-center justify-between">
      <Image src={Logo} alt="Logo" />
      <label htmlFor="" className="relative w-[650px]">
        <Image
          src={SearchIcon}
          alt="Search Icon"
          className="absolute top-1/2 -translate-y-1/2 left-2"
        />
        <input
          placeholder="Search"
          type="text"
          className="outline-none w-full border border-black rounded-xl pl-9 py-1 h-9 text-base"
        />
      </label>
      <ConnectWallet />
    </div>
  );
};
