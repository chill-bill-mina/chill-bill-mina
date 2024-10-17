/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@/hooks/useQuery";
import {
  GetProductType,
  GetPurchaseType,
  ProductInfoType,
} from "@/types/product";
import { useEffect, useState } from "react";
import { ProductInfo } from "./ProductInfo";
import { ProductOverview } from "./ProductOverview";
import { Checkout } from "./Checkout";
import { usePathname } from "next/navigation";

const ProductPage = ({ product_id }: { product_id: string }) => {
  const [state, setState] = useState<"step1" | "step2">("step1");

  const pathname = usePathname();

  const pageType = pathname.split("/")[1];

  const [infoData, setInfoData] = useState<ProductInfoType>();

  const [features, setFeatures] = useState<any>();

  const { data, fetchData, isLoading } = useQuery<GetProductType>();

  const {
    data: purchasedData,
    fetchData: fetchPurchasedData,
    isLoading: purchaseLoading,
  } = useQuery<GetPurchaseType>();

  useEffect(() => {
    if (!product_id) return;
    if (pageType === "buy-product") {
      fetchData(`/api/user/get-product?product_id=${product_id}`);
    } else {
      fetchPurchasedData(`/api/user/get-purchase?purchase_id=${product_id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product_id]);

  useEffect(() => {
    if (!data) return;
    setInfoData({
      product_id: data.productId,
      features: data.features,
      _id: data._id,
      imageUrl: data.imageUrl,
      name: data.name,
      price: data.price,
    });
    setFeatures(data.features);
  }, [data]);

  useEffect(() => {
    if (!purchasedData) return;
    setInfoData({
      product_id: purchasedData.product.productId,
      features: purchasedData.product.features,
      _id: purchasedData.product._id,
      imageUrl: purchasedData.product.imageUrl,
      name: purchasedData.product.name,
      price: purchasedData.product.price,
    });
    setFeatures(purchasedData.product.features);
  }, [purchasedData]);

  if (isLoading || purchaseLoading) return null;

  if (state === "step1") {
    return (
      <div className="m-[50px]">
        <ProductInfo
          purchase={purchasedData}
          product_info={infoData as ProductInfoType}
          setState={setState}
        />
        <ProductOverview features={features} />
      </div>
    );
  } else if (state === "step2" && data) {
    return <Checkout price={data.price} productId={data?.productId} />;
  }
};

export default ProductPage;
