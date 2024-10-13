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
  contractDetails: ContractDetailType;
}

export interface ContractDetailType {
  contractAddress: string;

  deploy: {
    transactionHash: string;
    isDeployed: boolean;
  };

  init: {
    transactionHash: string;
    isInitialized: boolean;
  };

  sell: {
    transactionHash: string;
    isSold: boolean;
  };
}
