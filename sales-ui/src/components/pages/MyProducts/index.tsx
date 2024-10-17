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
            <th>Quantity</th>
            <th>Contract Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((purchase) => (
            <tr
              key={purchase.product._id}
              className="border-t border-[#D9D9D9]"
            >
              <td className="p-5 flex items-center justify-center">
                <Image
                  src={purchase.product.imageUrl}
                  alt={purchase.product.name}
                  width={72}
                  height={72}
                />
              </td>
              <td className="text-center">{purchase.product.name}</td>
              <td className="text-center">#{purchase.product.productId}</td>
              <td className="text-center">{purchase.product.price}$</td>
              <td className={`text-center`}>{purchase.quantity}</td>
              <td
                className={`text-center ${
                  purchase?.status === "pending" || !purchase?.contractAddress
                    ? "text-orange-400"
                    : ""
                }`}
              >
                <button
                  onClick={() => {
                    if (purchase?.contractAddress)
                      window.navigator.clipboard.writeText(
                        purchase?.contractAddress
                      );
                  }}
                >
                  {purchase.status === "pending"
                    ? "Pending"
                    : !!purchase?.contractAddress
                    ? purchase?.contractAddress.slice(0, 10) +
                      "..." +
                      purchase?.contractAddress.slice(-10)
                    : "Pending..."}
                </button>
              </td>
              <td>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() =>
                      router.push(`/product-detail/${purchase.purchaseId}`)
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
