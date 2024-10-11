"use client";
import React, { useEffect, useState } from "react";

import ZkappWorkerClient from "@/lib/zkAppWorkerClient";
import { PrivateKey, PublicKey } from "o1js";
import { TransactionFee } from "@/lib/constant";
import { GetPurchaseResponse } from "@/types/purchase";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    mina: any;
  }
}

const TestPage = () => {
  const [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
    contractPK: "",
    candidateContractPK: "",
    deploymentTX: "",
    interactionTX: "",
  });

  const [displayText, setDisplayText] = useState<string[]>([]);

  // -------------------------------------------------------
  // Do Setup
  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }
    (async () => {
      if (!state.hasBeenSetup) {
        setDisplayText((prev) => [...prev, "Initializing worker client."]);
        const zkappWorkerClient = new ZkappWorkerClient();

        await timeout(5); // wait for worker to load

        await zkappWorkerClient.setActiveInstanceToDevnet();

        // check if wallet is connected
        const mina = window.mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        setDisplayText((prev) => [
          ...prev,
          `using key ${publicKey.toBase58()}`,
        ]);
        setDisplayText((prev) => [...prev, "checking if account exists..."]);

        setDisplayText((prev) => [...prev, "checking if account exists..."]);
        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });
        const accountExists = res.error == null;

        setDisplayText((prev) => [...prev, "loading contract..."]);
        await zkappWorkerClient.loadContract();

        setDisplayText((prev) => [...prev, "compiling zkApp"]);
        await zkappWorkerClient.compileContract();
        setDisplayText((prev) => [...prev, "zkApp compiled"]);

        const zkappPublicKey = null;

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          setDisplayText((prev) => [...prev, "checking if account exists..."]);
          const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);

  async function deployNewContract() {
    const mina = window.mina;

    if (mina == null) {
      setState({ ...state, hasWallet: false });
      return;
    }

    setState({ ...state, creatingTransaction: true });
    setDisplayText((prev) => [...prev, "sending a deployment transaction..."]);

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    const privateKey: PrivateKey = PrivateKey.random();
    setDisplayText((prev) => [
      ...prev,
      `generated new contract private key: => ${privateKey.toBase58()}`,
    ]);

    const zkappPublicKey = privateKey.toPublicKey();
    const contractPK = zkappPublicKey.toBase58();
    setDisplayText((prev) => [
      ...prev,
      `its corresponding public key is => ${contractPK}`,
    ]);

    setDisplayText((prev) => [...prev, "creating deployment transaction..."]);

    if (!state.publicKey) return;
    await state.zkappWorkerClient!.createDeployContract(
      privateKey,
      state.publicKey
    );

    setDisplayText((prev) => [...prev, "getting Transaction JSON..."]);

    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

    setDisplayText((prev) => [...prev, "checking AURO connection"]);

    const network = await window.mina.requestNetwork();

    setDisplayText((prev) => [...prev, `Network: ${network}`]);

    setDisplayText((prev) => [...prev, "requesting send transaction..."]);

    const { hash } = await window.mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: TransactionFee,
        memo: "",
      },
    });

    setDisplayText((prev) => [
      ...prev,
      `https://minascan.io/devnet/tx/${hash}?type=zk-tx`,
    ]);

    setState({
      ...state,
      creatingTransaction: false,
      deploymentTX: hash,
      contractPK,
      zkappPublicKey,
    });
  }

  const redirectToWallet = () => {
    if (state.hasWallet != null && !state.hasWallet) {
      const auroLink = "https://www.aurowallet.com/";
      return (
        <div>
          Could not find a wallet. Install Auro wallet here:{" "}
          <a href={auroLink} target="_blank" rel="noreferrer">
            {" "}
            [Link]{" "}
          </a>
        </div>
      );
    }
  };

  const setupText = () => {
    const text = state.hasBeenSetup ? "O1js Ready" : "Setting up O1js...";
    return <div> {text}</div>;
  };

  const dispalaySmartContractLink = () => {
    if (state.contractPK != "") {
      const smartContractLink = `https://minascan.io/devnet/account/${state.contractPK}?type=zk-acc`;
      return (
        <div>
          Your smart contract is{" "}
          <a href={smartContractLink} target="_blank">
            {state.contractPK}
          </a>
        </div>
      );
    }
  };

  const displayDeploymentTX = () => {
    if (state.deploymentTX !== "") {
      const deploymentTXLink = `https://minascan.io/devnet/tx/${state.deploymentTX}?type=zk-tx`;
      return (
        <div>
          Your smart contract deployment transaction is{" "}
          <a href={deploymentTXLink} target="_blank">
            {state.deploymentTX}
          </a>
        </div>
      );
    }
  };

  const deployButton = () => {
    if (state.hasBeenSetup && state.accountExists) {
      return (
        <div>
          <button onClick={deployNewContract}>Deploy New Contract</button>
        </div>
      );
    }
  };

  const displayTexts = () => {
    return displayText.map((text, index) => <div key={index}>{text}</div>);
  };

  const onInitializeContract = async () => {
    setState({ ...state, creatingTransaction: true });
    setDisplayText((prev) => [...prev, "sending a transaction..."]);

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    const dummyData: GetPurchaseResponse = {
      imageUrl:
        "https://media3.bsh-group.com/Product_Shots/900x/MCSA03336080_WIW28501GB_def.webp",
      ownerName: "John Doe",
      ownerAddress: "0x1234567890",
      price: 100,
      productID: "1",
      productName: "Product 1",
      purchaseId: "66fed751baecf9295468d736",
      quantity: 1,
      invoiceNumber: "56789",
      saleDate: 20230909,
      email: "keremkaya@gmail.com",
      phoneNumber: "+4545",
      productDescription: "This is a product description",
      vatAmount: 20,
      discountAmount: 10,
    };

    if (!state.publicKey) return;
    await state.zkappWorkerClient!.createInitTransaction(
      state.publicKey,
      dummyData
    );
    setDisplayText((prev) => [...prev, "creating proof..."]);
    await state.zkappWorkerClient!.proveUpdateTransaction();

    setDisplayText((prev) => [...prev, "getting Transaction JSON..."]);
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

    console.log("Transaction JSON: ", transactionJSON);

    setDisplayText((prev) => [...prev, "checking AURO connection"]);
    const network = await window.mina.requestNetwork();
    setDisplayText((prev) => [...prev, `Network: ${network}`]);
    const accounts = await window.mina.requestAccounts();
    setDisplayText((prev) => [...prev, `Accounts: ${accounts}`]);

    setDisplayText((prev) => [...prev, "requesting send transaction..."]);
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: TransactionFee,
        memo: "",
      },
    });

    setDisplayText((prev) => [
      ...prev,
      `https://minascan.io/devnet/tx/${hash}?type=zk-tx`,
    ]);

    setState({ ...state, interactionTX: hash, creatingTransaction: false });
  };

  console.log("creatingTransaction", state.creatingTransaction);

  const initializeContract = () => {
    return (
      <div>
        <button onClick={deployNewContract}>deploy new</button>
      </div>
    );
  };

  const interactionTx = () => {
    const tx = `https://minascan.io/devnet/tx/${state.interactionTX}?type=zk-tx`;

    if (state.interactionTX !== "") {
      return (
        <div>
          Your smart contract interaction transaction is{" "}
          <a href={tx} target="_blank">
            {state.interactionTX}
          </a>
        </div>
      );
    }
  };

  return (
    <div>
      {setupText()}
      {redirectToWallet()}
      {displayTexts()}
      {deployButton()}
      {dispalaySmartContractLink()}
      {displayDeploymentTX()}
      {initializeContract()}
      {interactionTx()}
    </div>
  );
};

export default TestPage;
