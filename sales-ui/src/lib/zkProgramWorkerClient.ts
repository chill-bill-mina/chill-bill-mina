/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchAccount, PublicKey } from "o1js";

import type {
  ZkProgramWorkerRequest,
  ZkProgramWorkerReponse,
  WorkerFunctions,
} from "./zkProgramWorker";
import { GetPurchaseType } from "@/types/product";

export default class ZkProgramWorkerClient {
  // ---------------------------------------------------------------------------------------

  setActiveInstanceToDevnet() {
    return this._call("setActiveInstanceToDevnet", {});
  }
  loadProgram() {
    return this._call("loadProgram", {});
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

  compileProgram() {
    return this._call("compileProgram", {});
  }

  generateMerkleTree(productInfo: GetPurchaseType) {
    return this._call("generateMerkleTree", {
      productInfo,
    });
  }

  generateProof(zkAppAddress: PublicKey): ReturnType<any> {
    return this._call("generateProof", {
      zkAppAddress58: zkAppAddress.toBase58(),
    });
  }

  // ---------------------------------------------------------------------------------------

  worker: Worker;

  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };

  nextId: number;

  constructor() {
    //import.meta.url - Provides the URL of the currently executing module
    this.worker = new Worker(new URL("./zkProgramWorker.ts", import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkProgramWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkProgramWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };
      this.worker.postMessage(message);
      this.nextId++;
    });
  }
}