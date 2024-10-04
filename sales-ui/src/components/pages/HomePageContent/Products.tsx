"use client";
import React, { useEffect } from "react";

import { useQuery } from "@/hooks/useQuery";
import { GetProductsResponse } from "@/types/product";
import { ProductCard } from "./ProductCard";

export const Products = () => {
  const { data, fetchData } = useQuery<GetProductsResponse>();

  useEffect(() => {
    fetchData("/api/user/products");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-4 gap-y-8 justify-between mx-[50px]">
      {data?.products.map((product) => (
        <ProductCard key={product._id} {...product} />
      ))}
    </div>
  );
};
