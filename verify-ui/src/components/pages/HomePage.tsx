import Image from "next/image";
import { HomeCard } from "./HomeCard";

export const HomePage = () => {
  const cards = [
    {
      title: "2 Year Warranty",
      description:
        "All Bosch home appliances come complete with a 2 year warranty as standard to protect against any manufacturing or material faults during this period. This warranty can be extended to a total of 5 years within 28 days of purchase.",
      image: "/assets/card1.png",
    },
    {
      title: "Your Privacy",
      description:
        "Make your purchases through our authorized dealers with the security of the Mina blockchain. We value your privacy.",
      image: "/assets/card2.png",
    },
    {
      title: "Discover Dealers",
      description: "Check out the dealer nearest to you. ",
      image: "/assets/card3.png",
      isArrow: true,
    },
  ];
  return (
    <div className="flex-1 flex relative">
      <div className="w-1/2 h-full relative">
        <div className="absolute bg-[#F5F5F5] inset-0 rounded-[48px] z-[-1]"></div>
        <div className="absolute top-[5%] left-[10%]">
          <p className="text-[64px] font-bold w-[350px]">
            Always in your control of comfort
          </p>
          <div className="bg-black p-4 flex items-center gap-x-2 mt-4">
            <span className="text-white font-bold text-xl">
              Show all product
            </span>
            <Image
              src="/assets/right-arrow.svg"
              alt="right"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-[5%] right-[5%] left-[5%]">
        <div className="w-full flex items-stretch justify-between">
          {cards.map((card) => (
            <HomeCard key={card.title} {...card} />
          ))}
        </div>
      </div>
      <div className="w-1/2 h-full relative">
        <div
          className="absolute inset-0 z-[-1]"
          style={{
            backgroundImage: "url('/assets/main-cover.png')",
            backgroundSize: "cover",
            backgroundPosition: "top",
            height: "100%",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
    </div>
  );
};
