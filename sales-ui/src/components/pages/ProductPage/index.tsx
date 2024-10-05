"use client";

import { useQuery } from "@/hooks/useQuery";
import { GetProductType } from "@/types/product";
import { useEffect } from "react";
import { ProductInfo } from "./ProductInfo";
import { ProductOverview } from "./ProductOverview";

const ProductPage = ({ product_id }: { product_id: string }) => {
  const { data, fetchData } = useQuery<GetProductType>();

  useEffect(() => {
    fetchData(`/api/user/get-product?product_id=${product_id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product_id]);

  if (!data) return null;

  return (
    <div className="m-[50px]">
      <ProductInfo
        product_info={{
          product_id: data.productId,
          features: data.features,
          _id: data._id,
          imageUrl: data.imageUrl,
          name: data.name,
          price: data.price,
        }}
      />
      <ProductOverview features={data.features} />
    </div>
  );
};

export default ProductPage;
