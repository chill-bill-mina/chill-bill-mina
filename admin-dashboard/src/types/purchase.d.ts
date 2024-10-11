export interface GetPurchaseResponse {
  purchaseId: string;
  productID: string;
  saleDate: number;
  ownerName: string;
  ownerAddress: string;
  price: number;
  email: string;
  phoneNumber: string;
  productDescription: string;
  vatAmount: number;
  discountAmount: number;
  quantity: number;
  invoiceNumber: string;
  imageUrl: string;
  productName: string;
}
