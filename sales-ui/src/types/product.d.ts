export interface GetProductType {
  _id: string;
  name: string;
  imageUrl: string;
}

export interface GetProductsResponse {
  products: GetProductType[];
}
