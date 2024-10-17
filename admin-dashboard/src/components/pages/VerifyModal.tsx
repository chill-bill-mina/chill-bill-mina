/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from "@/hooks/useQuery";
import { TransactionFee } from "@/lib/constant";
import ZkappWorkerClient from "@/lib/zkAppWorkerClient";
import { GetPurchaseResponse } from "@/types/purchase";
import { PrivateKey, PublicKey } from "o1js";
import { useEffect, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";

declare global {
  interface Window {
    mina: any;
  }
}

interface VerifyModalProps {
  purchase: GetPurchaseResponse;
  setOpenModalP: (purchase: GetPurchaseResponse | null) => void;
}

export const VerifyModal = ({ purchase, setOpenModalP }: VerifyModalProps) => {
  const [state, setState] = useState<"start" | "deploy" | "init" | "sell">(
    "deploy"
  );
  const [butonDisabled, setButonDisabled] = useState<boolean>(true);

  const ref = useDetectClickOutside({
    onTriggered: () => {
      setOpenModalP(null);
    },
  });

  useEffect(() => {
    if (
      !purchase.contractDetails?.deploy.isDeployed &&
      !purchase.contractDetails?.deploy.transactionHash &&
      !purchase.contractDetails?.contractAddress
    ) {
      setState("deploy");
      setButonDisabled(false);
    }
    if (
      !purchase.contractDetails?.deploy.isDeployed &&
      purchase.contractDetails?.deploy.transactionHash &&
      purchase.contractDetails?.contractAddress
    ) {
      setState("deploy");
      setButonDisabled(true);
    }
    if (
      purchase.contractDetails?.deploy.isDeployed &&
      !purchase.contractDetails?.init.isInitialized &&
      !purchase.contractDetails?.init.transactionHash
    ) {
      setState("init");
      setButonDisabled(false);
    }
    if (
      purchase.contractDetails?.deploy.isDeployed &&
      !purchase.contractDetails?.init.isInitialized &&
      purchase.contractDetails?.init.transactionHash
    ) {
      setState("init");
      setButonDisabled(true);
    }
    if (
      purchase.contractDetails?.deploy.isDeployed &&
      purchase.contractDetails?.init.isInitialized &&
      !purchase.contractDetails?.sell.isSold &&
      !purchase.contractDetails?.sell.transactionHash
    ) {
      setState("sell");
      setButonDisabled(false);
    }
    if (
      purchase.contractDetails?.deploy.isDeployed &&
      purchase.contractDetails?.init.isInitialized &&
      !purchase.contractDetails?.sell.isSold &&
      purchase.contractDetails?.sell.transactionHash
    ) {
      setState("sell");
      setButonDisabled(true);
    }
  }, [purchase]);

  const { postData } = useQuery();

  const [contract, setContract] = useState<{
    isStarted: boolean;
    contractPK58: string | null;
    contractTX: string | null;
  }>({
    isStarted: false,
    contractPK58: null,
    contractTX: null,
  });

  async function timeout(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  async function deployNewContract() {
    setContract({ isStarted: true, contractPK58: null, contractTX: null });
    console.log("Initializing worker client.");
    const zkappWorkerClient = new ZkappWorkerClient();

    await timeout(5); // wait for worker to load

    await zkappWorkerClient.setActiveInstanceToDevnet();

    // check if wallet is connected
    const mina = window.mina;

    if (mina == null) {
      return;
    }

    const deployerPublicKeyBase58: string = (await mina.requestAccounts())[0];
    const deployerPublicKey = PublicKey.fromBase58(deployerPublicKeyBase58);
    console.log("Using public key:", deployerPublicKey);

    // check if account exists
    const resFetchAccount = await zkappWorkerClient.fetchAccount({
      publicKey: deployerPublicKey!,
    });
    const accountExists = resFetchAccount.error == null;

    console.log("Account exists:", accountExists);

    console.log("Loading contract...");
    await zkappWorkerClient.loadContract();

    console.log("compiling contract...");
    await zkappWorkerClient.compileContract();

    console.log("zkApp compiled");

    console.log("Deploying contract...");

    const privateKey: PrivateKey = PrivateKey.random();

    console.log("Generated private key:", privateKey.toBase58());

    const zkappPublicKey = privateKey.toPublicKey();
    const contractPK = zkappPublicKey.toBase58();

    console.log("Contract public key:", contractPK);

    console.log("creating deploy transaction...");

    await zkappWorkerClient!.createDeployContract(
      privateKey,
      deployerPublicKey
    );

    console.log("getting transaction JSON...");

    const transactionJSON = await zkappWorkerClient!.getTransactionJSON();

    console.log("checking AURO connection...");

    const network = await window.mina.requestNetwork();

    console.log(`Network: ${network}`);

    console.log("sending transaction...");

    const { hash } = await window.mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: TransactionFee,
        memo: "",
      },
    });

    console.log("Transaction hash:", hash);

    console.log(
      "tx in minascan " + `https://minascan.io/devnet/tx/${hash}?type=zk-tx`
    );

    console.log("Transaction sent.");
    setContract({
      contractPK58: contractPK,
      contractTX: hash,
      isStarted: false,
    });
    postData("/api/admin/deploy", {
      purchaseId: purchase.purchaseId,
      tx: hash,
      contractPK,
    }).then(() => {
      setButonDisabled(true);
    });
  }

  const sellHandler = async () => {
    setContract({
      isStarted: true,
      contractPK58: purchase.contractDetails?.contractAddress,
      contractTX: null,
    });
    console.log("Initializing worker client.");
    const zkappWorkerClient = new ZkappWorkerClient();

    await timeout(5); // wait for worker to load

    await zkappWorkerClient.setActiveInstanceToDevnet();

    // check if wallet is connected
    const mina = window.mina;

    if (mina == null) {
      return;
    }

    const buyerPublicKeyBase58: string = purchase.ownerAddress;
    const buyerPublicKey = PublicKey.fromBase58(buyerPublicKeyBase58);
    console.log("Using public key:", buyerPublicKey);

    // check if account exists
    const resFetchAccount = await zkappWorkerClient.fetchAccount({
      publicKey: buyerPublicKey!,
    });
    const accountExists = resFetchAccount.error == null;

    const deployerPublicKeyBase58: string = (await mina.requestAccounts())[0];
    const deployerPublicKey = PublicKey.fromBase58(deployerPublicKeyBase58);
    console.log("Using public key:", deployerPublicKey);

    await zkappWorkerClient.fetchAccount({
      publicKey: deployerPublicKey!,
    });

    console.log("Account exists:", accountExists);

    console.log("Loading contract...");
    await zkappWorkerClient.loadContract();

    console.log("compiling contract...");
    await zkappWorkerClient.compileContract();

    console.log("zkApp compiled");

    console.log("Initializing contract...");

    const contractPK = PublicKey.fromBase58(
      purchase.contractDetails.contractAddress!
    );

    await zkappWorkerClient!.createSellTransaction(
      buyerPublicKey,
      purchase,
      contractPK,
      deployerPublicKey
    );

    console.log("creating proof...");

    await zkappWorkerClient.proveUpdateTransaction();

    console.log("getting transaction JSON...");

    const transactionJSON = await zkappWorkerClient!.getTransactionJSON();

    console.log("checking AURO connection...");

    const network = await window.mina.requestNetwork();

    console.log(`Network: ${network}`);

    console.log("sending transaction...");

    const { hash } = await window.mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: TransactionFee,
        memo: "",
      },
    });

    console.log("Transaction hash:", hash);

    console.log(
      "tx in minascan " + `https://minascan.io/devnet/tx/${hash}?type=zk-tx`
    );

    console.log("Transaction sent.");

    setContract({
      contractPK58: purchase.contractDetails?.contractAddress,
      contractTX: hash,
      isStarted: false,
    });

    postData("/api/admin/sell", {
      purchaseId: purchase.purchaseId,
      tx: hash,
    }).then(() => {
      setButonDisabled(true);
    });
  };

  const initHandler = async () => {
    setContract({
      isStarted: true,
      contractPK58: null,
      contractTX: null,
    });
    console.log("Initializing worker client.");
    const zkappWorkerClient = new ZkappWorkerClient();

    await timeout(5); // wait for worker to load

    await zkappWorkerClient.setActiveInstanceToDevnet();

    // check if wallet is connected
    const mina = window.mina;

    if (mina == null) {
      return;
    }

    const deployerPublicKeyBase58: string = (await mina.requestAccounts())[0];
    const deployerPublicKey = PublicKey.fromBase58(deployerPublicKeyBase58);
    console.log("Using public key:", deployerPublicKeyBase58);

    // check if account exists
    const resFetchAccount = await zkappWorkerClient.fetchAccount({
      publicKey: deployerPublicKey!,
    });
    const accountExists = resFetchAccount.error == null;

    console.log("Account exists:", accountExists);

    console.log("Loading contract...");
    await zkappWorkerClient.loadContract();

    console.log("compiling contract...");
    await zkappWorkerClient.compileContract();

    console.log("zkApp compiled");

    console.log("Initializing contract...");

    if (!purchase.contractDetails?.contractAddress) {
      console.error("Contract address is not found.");
      return;
    }

    const contractPK = PublicKey.fromBase58(
      purchase.contractDetails.contractAddress!
    );

    await zkappWorkerClient.fetchAccount({
      publicKey: contractPK!,
    });
    console.log("contractPK", contractPK.toBase58());

    await zkappWorkerClient!.createInitTransaction(
      deployerPublicKey,
      purchase,
      contractPK
    );

    console.log("creating proof...");

    await zkappWorkerClient.proveUpdateTransaction();

    console.log("getting transaction JSON...");

    const transactionJSON = await zkappWorkerClient!.getTransactionJSON();

    console.log("checking AURO connection...");

    const network = await window.mina.requestNetwork();

    console.log(`Network: ${network}`);

    console.log("sending transaction...");

    const { hash } = await window.mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: TransactionFee,
        memo: "",
      },
    });

    console.log("Transaction hash:", hash);

    console.log(
      "tx in minascan " + `https://minascan.io/devnet/tx/${hash}?type=zk-tx`
    );

    console.log("Transaction sent.");

    setContract({
      contractPK58: purchase.contractDetails?.contractAddress,
      contractTX: hash,
      isStarted: false,
    });

    postData("/api/admin/init", {
      purchaseId: purchase.purchaseId,
      tx: hash,
    }).then(() => {
      setButonDisabled(true);
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-10 pointer-events-none"></div>
      <div
        ref={ref}
        className="bg-[#D9D9D9] p-20 flex flex-col items-center gap-y-8 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        {state === "init" && <InitModal {...purchase} />}
        <DeployModal contract={contract} state={state} />
        <div className="flex items-center gap-x-[180px]">
          <div className="flex flex-col items-center">
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full before:content-[''] relative before:absolute before:left-10 before:w-[100px] before:h-[1px] before:bg-[#979797] ${
                state === "deploy"
                  ? "bg-[#71B5DC] text-white"
                  : "bg-transparent border border-black"
              }`}
            >
              1
            </button>
            <span>Deploy</span>
          </div>
          <div className="flex flex-col items-center">
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full before:content-[''] after:content-[''] after:absolute after:right-10 after:w-[100px] after:h-[1px] after:bg-[#979797] relative before:absolute before:left-10 before:w-[100px] before:h-[1px] before:bg-[#979797] ${
                state === "init"
                  ? "bg-[#71B5DC] text-white"
                  : "bg-transparent border border-black"
              }`}
            >
              2
            </button>
            <span>Initialize</span>
          </div>
          <div className="flex flex-col items-cente">
            <button
              className={`w-10 h-10 flex items-center justify-center rounded-full before:content-[''] relative before:absolute before:right-10 before:w-[100px] before:h-[1px] before:bg-[#979797] ${
                state === "sell"
                  ? "bg-[#71B5DC] text-white"
                  : "bg-transparent border border-black"
              }`}
            >
              3
            </button>
            <span>Sell</span>
          </div>
        </div>
        <button
          disabled={butonDisabled || contract.isStarted}
          onClick={() => {
            if (state === "init") initHandler();
            else if (state === "deploy") deployNewContract();
            else if (state === "sell") sellHandler();
          }}
          className="bg-[#71B5DC] w-1/2 p-4 text-white rounded-lg"
        >
          {state === "deploy"
            ? "Deploy"
            : state === "init"
            ? "Initialize"
            : "Sell"}
          {contract.isStarted && "ing..."}
        </button>
      </div>
    </>
  );
};

const InitModal = (purchase: GetPurchaseResponse) => {
  return (
    <div className="flex flex-col gap-y-2 w-[400px]">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Product Id</p>
        <p>{purchase.productID}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Sale Date</p>
        <p>{purchase.saleDate}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Owner Name</p>
        <p>{purchase.ownerName}</p>
      </div>
      <div className="flex flex-col gap-y-2">
        <p className="font-semibold whitespace-nowrap">Owner Address</p>
        <p className="truncate">{purchase.ownerAddress}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Price</p>
        <p>{purchase.price}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Email</p>
        <p>{purchase.email}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Phone Number</p>
        <p>{purchase.phoneNumber}</p>
      </div>
      <div className="flex flex-col gap-y-2">
        <p className="font-semibold">Product Description</p>
        <p>{purchase.productDescription}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Vat Amount</p>
        <p>{purchase.vatAmount}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Discount Amount</p>
        <p>{purchase.discountAmount}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Quantity</p>
        <p>{purchase.quantity}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Invoice Number</p>
        <p>{purchase.invoiceNumber}</p>
      </div>
    </div>
  );
};

const DeployModal = ({
  contract,
  state,
}: {
  contract: {
    contractPK58: string | null;
    contractTX: string | null;
    isStarted: boolean;
  };
  state: "start" | "deploy" | "init" | "sell";
}) => {
  if (
    (!contract?.contractPK58 || !contract?.contractTX) &&
    !contract.isStarted
  ) {
    return;
  }

  if (contract.isStarted) {
    return (
      <div>
        {state === "deploy"
          ? "Deploying contract..."
          : state === "init"
          ? "Initializing contract..."
          : "Selling contract..."}
      </div>
    );
  }
  return (
    <div>
      {state === "deploy"
        ? "3 dakika içinde contract deploy edilecek. Lütfen bekleyin. Deploy işlemi tamamlandığında buraya gelerek initialize işlemine geçebilirsiniz."
        : state === "init"
        ? "3 dakika içinde contract initialize edilecek. Lütfen bekleyin. Initialize işlemi tamamlandığında buraya gelerek sell işlemine geçebilirsiniz."
        : "3 dakika içinde sell işlemi bitecek. Lütfen bekleyin."}
    </div>
  );
};
