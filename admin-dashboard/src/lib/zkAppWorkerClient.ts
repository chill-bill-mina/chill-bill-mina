/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchAccount, PrivateKey, PublicKey } from "o1js";

import type {
  ZkappWorkerRequest,
  ZkappWorkerReponse,
  WorkerFunctions,
} from "./zkAppWorker";
import { GetPurchaseResponse } from "@/types/purchase";

export default class ZkappWorkerClient {
  // ---------------------------------------------------------------------------------------

  setActiveInstanceToDevnet() {
    return this._call("setActiveInstanceToDevnet", {});
  }

  loadContract() {
    return this._call("loadContract", {});
  }

  proveUpdateTransaction() {
    return this._call("proveUpdateTransaction", {});
  }

  createInitTransaction(
    deployerAccount: PublicKey,
    productInfo: GetPurchaseResponse,
    contract: PublicKey
  ) {
    return this._call("createInitTransaction", {
      deployerAccountBase58: deployerAccount.toBase58(),
      productInfo,
      contractPKBase58: contract.toBase58(),
    });
  }

  createSellTransaction(
    buyerAccount: PublicKey,
    productInfo: GetPurchaseResponse,
    contract: PublicKey,
    deployerPublicKey: PublicKey
  ) {
    return this._call("createSellTransaction", {
      buyerAccountBase58: buyerAccount.toBase58(),
      productInfo,
      contractPKBase58: contract.toBase58(),
      deployerPublicKey58: deployerPublicKey.toBase58(),
    });
  }

  compileContract() {
    return this._call("compileContract", {});
  }

  fetchAccount({
    publicKey,
  }: {
    publicKey: PublicKey;
  }): ReturnType<typeof fetchAccount> {
    const result = this._call("fetchAccount", {
      publicKey58: publicKey.toBase58(),
    });
    return result as ReturnType<typeof fetchAccount>;
  }

  initZkappInstance(publicKey: PublicKey) {
    return this._call("initZkappInstance", {
      publicKey58: publicKey.toBase58(),
    });
  }

  createDeployContract(privateKey: PrivateKey, feePayer: PublicKey) {
    return this._call("createDeployContract", {
      privateKey58: privateKey.toBase58(),
      feePayerAddress58: feePayer.toBase58(),
    });
  }

  async getTransactionJSON() {
    const result = await this._call("getTransactionJSON", {});
    return result;
  }

  // ---------------------------------------------------------------------------------------

  worker: Worker;

  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };

  nextId: number;

  constructor() {
    //import.meta.url - Provides the URL of the currently executing module
    this.worker = new Worker(new URL("./zkappWorker.ts", import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkappWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };
      this.worker.postMessage(message);
      this.nextId++;
    });
  }
}
