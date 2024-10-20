/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PublicKey,
  Mina,
  fetchAccount,
  JsonProof,
  Struct,
  Field,
  ZkProgram,
} from "o1js";

// ---------------------------------------------------------------------------------------
export class ProductProofPublicInput extends Struct({
  productID: Field,
  saleDate: Field,
  zkAppAddress: PublicKey,
}) {}

export class ProductProofPublicOutput extends Struct({
  productInfoRoot: Field,
  owner: PublicKey,
  dealer: PublicKey,
  productID: Field,
  saleDate: Field,
}) {}

import { ProductProofProgram } from "../../../contracts/build/src/proofs/ProductProofProgram.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
class ProductProofProgramProof extends ZkProgram.Proof(ProductProofProgram) {}
const state = {
  ProductProofProgram: null as null | typeof ProductProofProgram,
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
  loadProgram: async () => {
    console.log("Loading ProductProofProgram...");
    const { ProductProofProgram } = await import(
      "../../../contracts/build/src/proofs/ProductProofProgram.js"
    );
    console.log("ProductProofProgram loaded.");
    state.ProductProofProgram = ProductProofProgram;
  },
  compileProgram: async () => {
    await state.ProductProofProgram!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },

  verify: async (args: { proof: JsonProof }) => {
    try {
      const proof = (await ProductProofProgramProof.fromJSON(
        args.proof
      )) as ProductProofProgramProof;
      const isValid = await state.ProductProofProgram!.verify(proof);
      return isValid;
    } catch (error) {
      return {
        error: error,
      };
    }
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
