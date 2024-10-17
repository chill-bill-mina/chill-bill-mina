/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  fetchAccount,
  Field,
  Poseidon,
  MerkleTree,
} from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { ProductContract } from "../../../contracts/build/src/ProductContract.js";
import { GetPurchaseResponse } from "@/types/purchase.js";

const state = {
  ProductContract: null as null | typeof ProductContract,
  zkapp: null as null | ProductContract,
  transaction: null as null | Transaction,
};

const convertStringToField = (str: string) => {
  const hexString = Buffer.from(str, "utf-8").toString("hex");

  const BigIntId = BigInt("0x" + hexString);

  return Field(BigIntId);
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToDevnet: async () => {
    const Network = Mina.Network(
      "https://api.minascan.io/node/devnet/v1/graphql"
    );
    console.log("Devnet network instance configured.");
    Mina.setActiveInstance(Network);
  },
  loadContract: async () => {
    const { ProductContract } = await import(
      "../../../contracts/build/src/ProductContract.js"
    );
    state.ProductContract = ProductContract;
  },
  compileContract: async () => {
    await state.ProductContract!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.ProductContract!(publicKey);
  },
  createDeployContract: async (args: {
    privateKey58: string;
    feePayerAddress58: string;
  }) => {
    const feePayer: PublicKey = PublicKey.fromBase58(args.feePayerAddress58);
    const zkAppPrivateKey: PrivateKey = PrivateKey.fromBase58(
      args.privateKey58
    );
    state.zkapp = new state.ProductContract!(zkAppPrivateKey.toPublicKey());
    const transaction = await Mina.transaction(feePayer, async () => {
      AccountUpdate.fundNewAccount(feePayer);
      state.zkapp!.deploy();
    });
    transaction.sign([zkAppPrivateKey]);
    state.transaction = transaction;
  },
  getTransactionJSON: async () => {
    console.log(state.transaction!.toPretty());
    return state.transaction!.toJSON();
  },
  createInitTransaction: async (args: {
    deployerAccountBase58: string;
    productInfo: GetPurchaseResponse;
    contractPKBase58: string;
  }) => {
    const contractPK: PublicKey = PublicKey.fromBase58(args.contractPKBase58);
    const deployerAccount: PublicKey = PublicKey.fromBase58(
      args.deployerAccountBase58
    );
    const productData = {
      productID: convertStringToField(args.productInfo.productID),
      saleDate: Field(args.productInfo.saleDateNum),
      ownerName: convertStringToField(args.productInfo.ownerName),
      ownerAddress: convertStringToField(args.productInfo.ownerAddress),
      price: Field(args.productInfo.price),
      email: convertStringToField(args.productInfo.email),
      phoneNumber: convertStringToField(args.productInfo.phoneNumber),
      productDescription: convertStringToField(
        args.productInfo.productDescription
      ),
      vatAmount: Field(args.productInfo.vatAmount),
      discountAmount: Field(args.productInfo.discountAmount),
      quantity: Field(args.productInfo.quantity),
      invoiceNumber: Field(args.productInfo.invoiceNumber),
    };
    const fieldValues = Object.values(productData);
    const fieldHashes = fieldValues.map((value) => Poseidon.hash([value]));

    // Create Merkle tree
    const productInfoTree = new MerkleTree(5);

    for (let i = 0; i < fieldHashes.length; i++) {
      productInfoTree.setLeaf(BigInt(i), fieldHashes[i]);
    }
    productInfoTree.setLeaf(
      BigInt(fieldHashes.length),
      Poseidon.hash([productData.productID, productData.saleDate])
    );

    // Get the root of the Merkle tree
    const productInfoRoot = productInfoTree.getRoot();
    const zkapp = new state.ProductContract!(contractPK);
    const transaction = await Mina.transaction(deployerAccount, async () => {
      zkapp!.initialize(deployerAccount, productInfoRoot);
    });
    state.transaction = transaction;
    state.zkapp = zkapp;
  },
  createSellTransaction: async (args: {
    buyerAccountBase58: string;
    productInfo: GetPurchaseResponse;
    contractPKBase58: string;
    deployerPublicKey58: string;
  }) => {
    const deployerPublicKey: PublicKey = PublicKey.fromBase58(
      args.deployerPublicKey58
    );
    const contractPK: PublicKey = PublicKey.fromBase58(args.contractPKBase58);
    const buyerAccount: PublicKey = PublicKey.fromBase58(
      args.buyerAccountBase58
    );
    const productData = {
      productID: convertStringToField(args.productInfo.productID),
      saleDate: Field(args.productInfo.saleDateNum),
      ownerName: convertStringToField(args.productInfo.ownerName),
      ownerAddress: convertStringToField(args.productInfo.ownerAddress),
      price: Field(args.productInfo.price),
      email: convertStringToField(args.productInfo.email),
      phoneNumber: convertStringToField(args.productInfo.phoneNumber),
      productDescription: convertStringToField(
        args.productInfo.productDescription
      ),
      vatAmount: Field(args.productInfo.vatAmount),
      discountAmount: Field(args.productInfo.discountAmount),
      quantity: Field(args.productInfo.quantity),
      invoiceNumber: Field(args.productInfo.invoiceNumber),
    };
    const fieldValues = Object.values(productData);
    const fieldHashes = fieldValues.map((value) => Poseidon.hash([value]));

    // Create Merkle tree
    const productInfoTree = new MerkleTree(5);

    for (let i = 0; i < fieldHashes.length; i++) {
      productInfoTree.setLeaf(BigInt(i), fieldHashes[i]);
    }
    productInfoTree.setLeaf(
      BigInt(fieldHashes.length),
      Poseidon.hash([productData.productID, productData.saleDate])
    );

    // Get the root of the Merkle tree
    const productInfoRoot = productInfoTree.getRoot();
    const zkapp = new state.ProductContract!(contractPK);
    const transaction = await Mina.transaction(deployerPublicKey, async () => {
      zkapp!.sell(buyerAccount, productInfoRoot);
    });
    state.transaction = transaction;
    state.zkapp = zkapp;
  },
  proveUpdateTransaction: async () => {
    await state.transaction!.prove();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

addEventListener("message", async (event: MessageEvent<ZkappWorkerRequest>) => {
  const returnData = await functions[event.data.fn](event.data.args);

  const message: ZkappWorkerReponse = {
    id: event.data.id,
    data: returnData,
  };
  postMessage(message);
});

console.log("Worker Initialized Successfully.");
