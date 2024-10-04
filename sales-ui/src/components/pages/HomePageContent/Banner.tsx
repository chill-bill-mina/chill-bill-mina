import Image from "next/image";

import BannerImg from "@/assets/images/Banner.png";
import ChillBill from "@/assets/images/chillbill.png";

export const Banner = () => {
  return (
    <div className="w-full relative">
      <Image src={BannerImg} alt="Banner" />
      <div className="absolute bottom-[72px] w-[580px] left-[72px] bg-white py-[18px] px-6">
        <h1 className="text-[32px]">Shop with confidence</h1>
        <p className="text-base ">
          Shop securely with Mina, no need to share your data away. Own it all,
          make it stay – your privacy, every day!
        </p>
        <div className="flex items-center gap-x-1">
          <span className="text-base">Powered By</span>
          <Image src={ChillBill} alt="ChillBill" />
        </div>
      </div>
    </div>
  );
};
