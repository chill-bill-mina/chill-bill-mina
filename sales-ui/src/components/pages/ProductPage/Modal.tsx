import ZkProgramWorkerClient from "@/lib/zkProgramWorkerClient";
import { GetPurchaseType } from "@/types/product";
import { PublicKey } from "o1js";

export const Modal = ({ purchase }: { purchase: GetPurchaseType | null }) => {
  async function timeout(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  const downloadJson = (data: object, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generate = async () => {
    console.log("Generating document...");

    if (!purchase || !purchase?.zkAppAddress) return;
    const zkProgramClient = new ZkProgramWorkerClient();

    await timeout(20);

    await zkProgramClient.setActiveInstanceToDevnet();

    const contractAddress58: string = purchase?.zkAppAddress;
    const contractAddress = PublicKey.fromBase58(contractAddress58);

    const resFetchAccount = await zkProgramClient.fetchAccount({
      publicKey: contractAddress!,
    });
    const accountExists = resFetchAccount.error == null;

    console.log("Account exists:", accountExists);

    console.log("Loading program...");
    await zkProgramClient.loadProgram();

    console.log("Compiling program...");
    await zkProgramClient.compileProgram();

    console.log("productInfo", purchase);

    const saleDate = new Date(purchase.saleDate);
    const formattedDate = parseInt(
      saleDate.getFullYear().toString() +
        (saleDate.getMonth() + 1).toString().padStart(2, "0") +
        saleDate.getDate().toString().padStart(2, "0")
    );
    await zkProgramClient.generateMerkleTree({
      ...purchase,
      saleDateNum: formattedDate,
      invoiceNumber: 0,
      productDescription: "description",
    });

    console.log("Document generated.");

    const proof = await zkProgramClient.generateProof(contractAddress);

    console.log("proof", proof);
    downloadJson(proof, "proof");
  };
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-10 pointer-events-none"></div>
      <div className="bg-[#D9D9D9] p-20 flex flex-col items-center fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <h2 className="text-2xl text-nowrap">
          Please select the documents you would like to receive.
        </h2>
        <div className="border border-black mt-8 w-full flex items-center p-4 rounded-lg gap-x-4">
          <input type="checkbox" checked onChange={() => {}} />
          <p>Warranty Certificate</p>
        </div>
        <button
          onClick={generate}
          className="bg-[#027BC0] bg-opacity-50 mt-8 text-white px-4 py-2"
        >
          Generate Document
        </button>
      </div>
    </>
  );
};
