import { ProductFeatureType } from "@/types/product";

export const ProductOverview = ({
  features,
}: {
  features: ProductFeatureType;
}) => {
  return (
    <div className="mt-[100px] text-black text-3xl font-semibold">
      Technical Overview
    </div>
  );
};
