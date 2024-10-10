import Image from "next/image";

import Logo from "@/assets/svg/logo.svg";
import SearchIcon from "@/assets/svg/search-icon.svg";
import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";
import { AccountModal } from "./AccountModal";

export const Header = () => {
  return (
    <div className="py-4 border-b border-black px-[50px] flex items-center justify-between">
      <Link href="/">
        <Image src={Logo} alt="Logo" />
      </Link>
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
      <div className="flex items-center gap-x-6">
        <AccountModal />
        <ConnectWallet />
      </div>
    </div>
  );
};
