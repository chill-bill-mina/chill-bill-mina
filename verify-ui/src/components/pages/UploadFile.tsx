/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import Image from "next/image";
import ZkProgramWorkerClient from "@/lib/zkProgramWorkerClient";
import { Field, JsonProof, PublicKey } from "o1js";
import { useRouter } from "next/navigation";

type PurchaseProofType = {
  expired: string;
  productId: string;
  ownerAddress: string;
  dealerAddress: string;
};

const convertPublicOutPutValueToPublicKey = (
  value1: string,
  value2: string
) => {
  const field1 = Field.from(value1);
  const field2 = Field.from(value2);

  const publicKey = PublicKey.fromFields([field1, field2]);
  const publicKey58 = publicKey.toBase58();
  return publicKey58;
};

const convertPublicOutPutValueToString = (value: string) => {
  const hexString = BigInt(value).toString(16);

  const str = Buffer.from(hexString, "hex").toString("utf-8");

  return str;
};

function transformDate(inputDate: string): string {
  // Input tarihi parse et
  const year = parseInt(inputDate.substring(0, 4));
  const month = inputDate.substring(4, 6);
  const day = inputDate.substring(6, 8);

  // Yılı 2 artır
  const newYear = year + 2;

  // Yeni tarihi istenen formatta döndür
  return `${newYear}/${month}/${day}`;
}

export const UploadFile = () => {
  const [fileEnter, setFileEnter] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [progressing, setProgressing] = useState<boolean>(false);
  const [purchaseProof, setPurchaseProof] = useState<PurchaseProofType | null>(
    null
  );
  const [purchaseProofStatus, setPurchaseProofStatus] = useState<
    "init" | "success" | "failed"
  >("init");

  const [contractAddress, setContractAddress] = useState<string>("");

  const router = useRouter();

  async function timeout(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  const startProcessing = async (json: JsonProof | null) => {
    if (!json) {
      return;
    }
    try {
      setProgressing(true);
      setProgress(0);

      console.log("Starting processing...");

      const zkProgramClient = new ZkProgramWorkerClient();
      setProgress(20);

      await timeout(20);

      setProgress(40);

      await zkProgramClient.setActiveInstanceToDevnet();

      console.log("Loading program...");
      await zkProgramClient.loadProgram();

      setProgress(60);

      console.log("Compiling program...");
      await zkProgramClient.compileProgram();

      setProgress(80);

      console.log("Verifying proof...");
      console.log("proofing file: ", json);
      const isValid = await zkProgramClient.verify({ proof: json });
      console.log("isValid", isValid);

      if ((isValid as any)?.error) {
        throw new Error("Error verifying proof.");
      }

      if (isValid) {
        setPurchaseProofStatus("success");
      } else {
        setPurchaseProofStatus("failed");
      }

      setProgress(100);
      setProgressing(false);
    } catch {
      console.error("Error processing proof.");
      setPurchaseProofStatus("failed");
      setProgressing(false);
      setProgress(100);
    }
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    setFileName(file.name);
    setFileSize(file.size);

    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        try {
          const json = JSON.parse(e.target.result);
          const ownerAddress58 = convertPublicOutPutValueToPublicKey(
            json.publicOutput[1],
            json.publicOutput[2]
          );
          const dealerAddress58 = convertPublicOutPutValueToPublicKey(
            json.publicOutput[3],
            json.publicOutput[4]
          );

          const productId = convertPublicOutPutValueToString(
            json.publicOutput[5]
          );

          const saleDate = json.publicOutput[6];

          setPurchaseProof({
            dealerAddress: dealerAddress58,
            ownerAddress: ownerAddress58,
            productId: productId,
            expired: transformDate(saleDate),
          });

          startProcessing(json);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    };
    reader.readAsText(file);
  };

  const formatFileSize = (size: number) => {
    if (size >= 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + " MB";
    } else if (size >= 1024) {
      return (size / 1024).toFixed(2) + " KB";
    } else {
      return size + " Bytes";
    }
  };

  const handleCheck = () => {
    if (!contractAddress) {
      return;
    }
    const url = `https://minascan.io/devnet/account/${contractAddress}?type=zk-acc`;
    router.push(url);
  };

  return (
    <div className="border-[#F66B05] border rounded-3xl w-2/3">
      <div className="p-6 flex items-stretch justify-between border-b border-[#CBD0DC]">
        <div className="flex items-stretch gap-x-4">
          {!purchaseProof || progressing ? (
            <Image
              src="/assets/upload.svg"
              alt="upload-icon"
              width={48}
              height={48}
            />
          ) : purchaseProofStatus === "success" ? (
            <Image
              src="/assets/check-ring.svg"
              alt="check"
              width={36}
              height={36}
            />
          ) : (
            <Image
              src="/assets/failed.svg"
              alt="check"
              width={36}
              height={36}
            />
          )}
          <div className="flex flex-col h-full justify-between">
            <p className="text-[#121211] text-opacity-70 font-extrabold">
              {!purchaseProof || progressing
                ? "Upload files"
                : purchaseProofStatus === "success"
                ? "Proof is valid."
                : "Proof is not valid!"}
            </p>
            <p className="text-[#121211] text-opacity-50">
              {progressing || !purchaseProof
                ? "Select and upload the files of your choice"
                : purchaseProofStatus === "success"
                ? " You can contact us to initiate your warranty period."
                : "Your ZK proof is not valid. Check again."}
            </p>
          </div>
        </div>
        {(!purchaseProof || progressing) && (
          <div>
            <Image src="/assets/close.svg" alt="close" width={24} height={24} />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="container px-4 max-w-5xl mx-auto">
          {!purchaseProof && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setFileEnter(true);
              }}
              onDragLeave={() => {
                setFileEnter(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setFileEnter(false);
                if (e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];
                  handleFileRead(file);
                }
              }}
              className={`${fileEnter ? "border-2" : "border"} ${
                purchaseProof ? "border-collapse" : "border-dashed"
              } py-8 rounded-2xl border-[#CBD0DC]`}
            >
              <label htmlFor="file" className="w-full h-full">
                <div className="flex flex-col items-center gap-y-6">
                  <Image
                    src="/assets/upload.svg"
                    alt="upload-icon"
                    width={32}
                    height={32}
                  />
                  <div className="flex flex-col items-center">
                    <p className="text-[#121211] text-opacity-70 font-extrabold">
                      Choose a file or drag & drop it here
                    </p>
                    <p className="text-[#121211] text-opacity-50">
                      JSON, up to 50MB
                    </p>
                  </div>
                  <div className="border flex py-2 px-4 w-fit text-[#54575C] rounded-lg">
                    Browse File
                  </div>
                </div>
              </label>
              <input
                id="file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileRead(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}
          {purchaseProof && purchaseProofStatus === "success" && (
            <div className="flex flex-col items-center">
              <div>
                <div className="flex flex-col gap-y-4 items-center">
                  <Image
                    src="/assets/check-ring.svg"
                    alt="check"
                    width={48}
                    height={48}
                  />
                  <div className="flex text-[#292D32]">
                    <p className="font-bold">Expiration date :</p>
                    &nbsp;
                    <p className="text-[#36DD56]">
                      {(purchaseProof as PurchaseProofType)?.expired}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold">ProductID :</p>
                    &nbsp;
                    <p className="font-medium">
                      {(purchaseProof as PurchaseProofType)?.productId}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold">Owner Address :</p>
                    &nbsp;
                    <p className="font-medium">
                      {(purchaseProof as PurchaseProofType)?.ownerAddress.slice(
                        0,
                        6
                      )}
                      ...
                      {(purchaseProof as PurchaseProofType)?.ownerAddress.slice(
                        -4
                      )}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="font-bold">Dealer Address :</p>
                    &nbsp;
                    <p className="font-medium">
                      {(
                        purchaseProof as PurchaseProofType
                      )?.dealerAddress.slice(0, 6)}
                      ...
                      {(
                        purchaseProof as PurchaseProofType
                      )?.dealerAddress.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
              <button className="border mt-4 border-[#CBD0DC] rounded-lg py-2 px-4 text-[#54575C]">
                Contact Us
              </button>
            </div>
          )}
          {!!purchaseProof && purchaseProofStatus === "failed" && (
            <div className="flex flex-col gap-y-4 items-center">
              <Image
                src="/assets/failed.svg"
                alt="check"
                width={48}
                height={48}
              />
              <label htmlFor="contract-input" className="w-[70%]">
                <input
                  type="text"
                  id="contract-input"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="outline-none border border-[#54575C] border-opacity-50 rounded-lg px-4 py-2 w-full"
                  placeholder="Product Contract Address"
                />
              </label>
              <button
                onClick={handleCheck}
                className="border border-[#54575C] border-opacity-50 px-6 py-3 rounded-xl"
              >
                Check
              </button>
            </div>
          )}
          {progressing && (
            <div className="bg-[#FFECDE] rounded-xl p-6 mt-6 flex flex-col relative justify-between">
              <div className="flex items-stretch gap-x-6">
                <Image
                  src="/assets/json.svg"
                  alt="json"
                  width={48}
                  height={48}
                />
                <div className="flex flex-col justify-between">
                  <p className="text-[#121211] text-opacity-70 font-extrabold">
                    {fileName}
                  </p>
                  <div className="flex">
                    <p className="text-[#121211] text-opacity-50">
                      {formatFileSize(fileSize)}
                    </p>
                    &nbsp;
                    <Image
                      src="/assets/uploading2.svg"
                      alt="uploading"
                      width={20}
                      height={20}
                      className="animate-spin"
                    />
                    &nbsp;
                    <span>Uploading...</span>
                  </div>
                </div>
              </div>
              <div className="w-full mt-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-[#F66B05] bg-opacity-30">
                    <div
                      style={{ width: `${progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#F66B05]"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
