"use client";

import { useQuery } from "@/hooks/useQuery";
import { GetProductType } from "@/types/product";
import { useEffect, useState } from "react";
import { ProductInfo } from "./ProductInfo";
import { ProductOverview } from "./ProductOverview";
import { Checkout } from "./Checkout";

const ProductPage = ({ product_id }: { product_id: string }) => {
  const [state, setState] = useState<"step1" | "step2">("step1");

  const { data, fetchData } = useQuery<GetProductType>();

  useEffect(() => {
    fetchData(`/api/user/get-product?product_id=${product_id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product_id]);

  if (!data) return null;

  if (state === "step1") {
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
          setState={setState}
        />
        <ProductOverview features={data.features} />
      </div>
    );
  } else if (state === "step2") {
    return <Checkout price={data.price} />;
  }
};

export default ProductPage;
