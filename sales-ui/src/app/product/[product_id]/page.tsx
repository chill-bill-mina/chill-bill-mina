const ProductDetail = ({ params }: { params: { product_id: string } }) => {
  console.log(params.product_id);
  return <div>{params.product_id}</div>;
};

export default ProductDetail;
