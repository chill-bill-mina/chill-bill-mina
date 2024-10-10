"use client";
import { useQuery } from "@/hooks/useQuery";
import { GetMyProductType } from "@/types/product";
import { useAppSelector } from "@/types/state";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MyProducts = () => {
  const { postData } = useQuery();

  const [products, setProducts] = useState<GetMyProductType[]>([]);

  // useEffect(() => {
  //   setProducts([
  //     {
  //       _id: "66fed751baecf9295468d736",
  //       imageUrl:
  //         "https://media3.bsh-group.com/Product_Shots/900x/MCSA03336080_WIW28501GB_def.webp",
  //       name: "Product 1",
  //       productId: "1",
  //       price: 100,
  //       contractAddress: "0x1234567890",
  //     },
  //     {
  //       _id: "66fed751baecf9295468d736",
  //       imageUrl:
  //         "https://media3.bsh-group.com/Product_Shots/900x/23472058_SMD8YCX03G_STP_def.webp",
  //       name: "Product 2",
  //       productId: "2",
  //       price: 200,
  //     },
  //   ]);
  // }, []);

  const { token } = useAppSelector((state) => state.session);

  const router = useRouter();

  useEffect(() => {
    if (!token) return;
    postData(`/api/user/my-products`, { token }).then((res) => {
      setProducts(res.products);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return (
    <div className="px-12">
      <div className="p-2 w-full flex items-center justify-between">
        <h1 className="text-4xl">My Products</h1>
        <div className="bg-[#71B5DC] text-2xl px-12 text-white py-3">
          Keep Shoping
        </div>
      </div>
      <table className="w-full mt-10">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Product ID</th>
            <th>Price</th>
            <th>Contract</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-t border-[#D9D9D9]">
              <td className="p-5 flex items-center justify-center">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={72}
                  height={72}
                />
              </td>
              <td className="text-center">{product.name}</td>
              <td className="text-center">#{product.productId}</td>
              <td className="text-center">{product.price}$</td>
              <td
                className={`text-center ${
                  !product?.contractAddress && "text-[#FFB200]"
                }`}
              >
                {product?.contractAddress ? product.contractAddress : "pending"}
              </td>
              <td>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() =>
                      router.push(`/product-detail/${product?._id}`)
                    }
                    className="bg-[#71B5DC] text-lg px-4 text-white py-1"
                  >
                    Detail
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyProducts;
