import { useRouter } from "next/navigation";
import Image from "next/image";

import { GetProductsType } from "@/types/product";

export const ProductCard = (product: GetProductsType) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/buy-product/${product._id}`);
  };
  return (
    <div
      onClick={handleClick}
      className="w-[300px] cursor-pointer flex flex-col items-center justify-center gap-y-9"
    >
      <div className="max-w-[200px] max-h-[200px] relative min-w-[100px] min-h-[100px]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          objectFit="contain"
        />
      </div>
      <div className="bg-[#D0D4D8] px-2 py-4 w-full">
        <p className="text-xl text-black truncate flex-1">{product.name}</p>
      </div>
    </div>
  );
};
