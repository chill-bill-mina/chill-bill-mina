import Image from "next/image";
import { FC } from "react";

interface HomeCardProps {
  image: string;
  title: string;
  description: string;
  isArrow?: boolean;
}

export const HomeCard: FC<HomeCardProps> = ({
  image,
  title,
  description,
  isArrow,
}) => {
  return (
    <div className="relative px-8 pb-8 pt-16 rounded-3xl bg-white w-[400px]">
      <div className="absolute top-2 right-2">
        <Image src={image} alt={title} width={100} height={100} />
      </div>
      {isArrow && (
        <div className="absolute bottom-4 right-4">
          <Image
            src="/assets/right-arrow2.png"
            alt="right-arrow2"
            width={40}
            height={40}
          />
        </div>
      )}
      <h4 className="text-[#121211] text-opacity-70 font-extrabold">{title}</h4>
      <p className="text-[#121211] text-opacity-50">{description}</p>
    </div>
  );
};
