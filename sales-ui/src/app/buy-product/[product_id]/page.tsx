import ProductPage from "@/components/pages/ProductPage";

export default async function ProductDetail({
  params,
}: {
  params: { product_id: string };
}) {
  return <ProductPage product_id={params.product_id} />;
}
