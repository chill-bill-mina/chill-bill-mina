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
  features: ProductFeatureType;
}

export interface ProductFeatureType {
  maxCapacityInKg: string;
  color: string[];
  reloadFunction: string;
  maxSpinSpeedInRpm: string;
  homeConnect: string;
  aquaStop: string;
  energyEfficiencyClass: string;
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

export interface GetMyProductType {
  _id: string;
  imageUrl: string;
  name: string;
  productId: string;
  price: number;
  contractAddress?: string;
}
