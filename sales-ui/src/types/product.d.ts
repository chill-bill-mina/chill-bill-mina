/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GetProductsType {
  _id: string;
  name: string;
  imageUrl: string;
}

export interface GetProductsResponse {
  products: GetProductType[];
}

export interface GetProductType {
  _id: string;
  name: string;
  productId: string;
  product_serie: string;
  imageUrl: string;
  price: number;
  vatAmount: number;
  discountAmount: number;
  description: string;
  features: any;
}

export interface ProductInfoType {
  _id: string;
  product_id: string;
  imageUrl: string;
  features: {
    color: string[];
  };
  price: number;
  name: string;
}

export interface GetPurchaseType {
  product: GetProductType;
  saleDate: string;
  zkAppAddress?: string;
  status: string;
}

export interface GetMyProductType {
  purchaseId: string;
  product: {
    _id: string;
    imageUrl: string;
    name: string;
    productId: string;
    price: number;
  };
  status: string;
  quantity: number;
  contractAddress?: string;
}
