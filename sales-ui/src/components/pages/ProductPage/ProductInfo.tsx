import { ProductInfoType } from "@/types/product";
import Image from "next/image";

export const ProductInfo = ({
  product_info,
}: {
  product_info: ProductInfoType;
}) => {
  const buyFunction = () => {
    //TODO: Implement buy function
  };
  return (
    <div className="w-full flex items-start">
      <div className="w-1/2 pr-[100px] border-r border-black border-opacity-50">
        <div className="max-w-[600px] max-h-[600px] relative min-w-[400px] min-h-[400px]">
          <Image
            src={product_info.imageUrl}
            alt={product_info.name}
            fill
            objectFit="contain"
          />
        </div>
      </div>
      <div className="w-1/2 pl-[100px] flex flex-col h-full">
        <div>
          <div>
            <h2 className="font-medium text-4xl">{product_info.name}</h2>
            <p className="text-xl text-gray-500">#{product_info.product_id}</p>
          </div>
          <h4 className="font-extrabold text-2xl mt-8">
            £{product_info.price}
          </h4>
        </div>
        {product_info.features.color.length > 0 && (
          <div className="mt-10">
            <span className="text-xl">Color:</span>
            <div className="flex items-start gap-x-2 mt-4">
              {product_info.features.color.map((color, index) => (
                <div key={index}>
                  <span className="text-black text-opacity-60 text-xl">
                    {color}
                  </span>
                  <div
                    className="w-10 h-10 mt-2"
                    style={{ backgroundColor: color }}
                  >
                    <Image
                      src={product_info.imageUrl}
                      alt={product_info.name}
                      width={64}
                      height={64}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={buyFunction}
          className="w-full bg-[#027BC0] mt-8 h-[72px] rounded-lg bg-opacity-70 text-2xl text-white"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};