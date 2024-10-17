/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Field,
  Poseidon,
  MerkleTree,
  Struct,
  MerkleWitness as BaseMerkleWitness,
  PublicKey,
  Mina,
  fetchAccount,
} from "o1js";

class MerkleWitness extends BaseMerkleWitness(5) {}

export class ProductData extends Struct({
  productID: Field,
  saleDate: Field,
  ownerName: Field,
  ownerAddress: Field,
  price: Field,
  email: Field,
  phoneNumber: Field,
  productDescription: Field,
  vatAmount: Field,
  discountAmount: Field,
  quantity: Field,
  invoiceNumber: Field,
}) {}

export class ProductProofPublicInput extends Struct({
  productID: Field,
  saleDate: Field,
  zkAppAddress: PublicKey,
}) {}

export class ProductProofPrivateInput extends Struct({
  merkleWitness: MerkleWitness,
}) {}

// ---------------------------------------------------------------------------------------

import { GetPurchaseType } from "@/types/product.js";
import { ProductProofProgram } from "../../../contracts/build/src/proofs/ProductProofProgram.js";

const state = {
  ProductProofProgram: null as null | typeof ProductProofProgram,
  productInfoTree: null as null | MerkleTree,
  productData: null as null | ProductData,
};

// ---------------------------------------------------------------------------------------
const generateMerkleTree = (productData: ProductData) => {
  const fieldValues = Object.values(productData);
  const fieldHashes = fieldValues.map((value) => Poseidon.hash([value]));

  const productInfoTree = new MerkleTree(5);

  for (let i = 0; i < fieldHashes.length; i++) {
    productInfoTree.setLeaf(BigInt(i), fieldHashes[i]);
  }
  productInfoTree.setLeaf(
    BigInt(fieldHashes.length),
    Poseidon.hash([productData.productID, productData.saleDate])
  );

  return productInfoTree;
};

const convertStringToField = (str: string) => {
  const hexString = Buffer.from(str, "utf-8").toString("hex");

  const BigIntId = BigInt("0x" + hexString);

  return Field(BigIntId);
};

const functions = {
  setActiveInstanceToDevnet: async () => {
    const Network = Mina.Network(
      "https://api.minascan.io/node/devnet/v1/graphql"
    );
    console.log("Devnet network instance configured.");
    Mina.setActiveInstance(Network);
  },
  loadProgram: async () => {
    const { ProductProofProgram } = await import(
      "../../../contracts/build/src/proofs/ProductProofProgram.js"
    );
    state.ProductProofProgram = ProductProofProgram;
  },
  compileProgram: async () => {
    await state.ProductProofProgram!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  generateMerkleTree: async (args: { productInfo: GetPurchaseType }) => {
    const productData: ProductData = {
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

    state.productData = productData;
    const productInfoTree = generateMerkleTree(productData);
    state.productInfoTree = productInfoTree;
  },

  generateProof: async (args: { zkAppAddress58: string }) => {
    const zkAppAddress: PublicKey = PublicKey.fromBase58(args.zkAppAddress58);
    const witness: MerkleWitness = new MerkleWitness(
      state.productInfoTree!.getWitness(
        BigInt(Object.keys(state.productData!).length)
      )
    );

    const publicInput = new ProductProofPublicInput({
      productID: state.productData!.productID,
      saleDate: state.productData!.saleDate,
      zkAppAddress: zkAppAddress,
    });
    const privateInput = new ProductProofPrivateInput({
      merkleWitness: witness,
    });

    const proof = await ProductProofProgram.verifyProductInfo(
      publicInput,
      privateInput
    );

    return proof.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkProgramWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkProgramWorkerReponse = {
  id: number;
  data: any;
};

addEventListener(
  "message",
  async (event: MessageEvent<ZkProgramWorkerRequest>) => {
    const returnData = await functions[event.data.fn](event.data.args);

    const message: ZkProgramWorkerReponse = {
      id: event.data.id,
      data: returnData,
    };
    postMessage(message);
  }
);

console.log("Worker Initialized Successfully.");
