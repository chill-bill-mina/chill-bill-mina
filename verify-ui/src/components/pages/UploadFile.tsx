"use client";
import React, { useState } from "react";
import Image from "next/image";

interface IFileContent {
  id: string;
  imageUrl: string;
  expired: string;
  productId: string;
  ownerAddress: string;
  dealerAddress: string;
}

export const UploadFile = () => {
  const [fileContent, setFileContent] = useState<IFileContent | null>(null);
  const [fileEnter, setFileEnter] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [progressing, setProgressing] = useState<boolean>(false);

  const startProcessing = () => {
    setProgressing(true);
    setProgress(0);

    const duration = 5000;
    const step = 100 / (duration / 100);

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      setProgress((prev) => prev + step);

      if (elapsed >= duration) {
        clearInterval(interval);
        setProgress(100);
        setProgressing(false);
      }
    }, 100);
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    setFileName(file.name);
    setFileSize(file.size);

    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        try {
          const json = JSON.parse(e.target.result);
          startProcessing();
          setFileContent(json);
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

  return (
    <div className="border-[#F66B05] border rounded-3xl w-2/3">
      <div className="p-6 flex items-stretch justify-between border-b border-[#CBD0DC]">
        <div className="flex items-stretch gap-x-4">
          {!fileContent || progressing ? (
            <Image
              src="/assets/upload.svg"
              alt="upload-icon"
              width={48}
              height={48}
            />
          ) : (
            <Image
              src="/assets/check-ring.svg"
              alt="check"
              width={36}
              height={36}
            />
          )}
          <div className="flex flex-col h-full justify-between">
            <p className="text-[#121211] text-opacity-70 font-extrabold">
              {!fileContent || progressing ? "Upload files" : "Proof is valid."}
            </p>
            <p className="text-[#121211] text-opacity-50">
              {!(!fileContent || progressing)
                ? "Select and upload the files of your choice"
                : " You can contact us to initiate your warranty period."}
            </p>
          </div>
        </div>
        {(!fileContent || progressing) && (
          <div>
            <Image src="/assets/close.svg" alt="close" width={24} height={24} />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="container px-4 max-w-5xl mx-auto">
          {!progressing && (
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
                fileContent ? "border-collapse" : "border-dashed"
              } py-8 rounded-2xl border-[#CBD0DC]`}
            >
              {!fileContent && (
                <>
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
                </>
              )}
              {fileContent && (
                <div className="flex flex-col items-center">
                  <div className="flex gap-x-16">
                    <Image
                      src={fileContent?.imageUrl}
                      alt="product-image"
                      width={150}
                      height={150}
                    />
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
                        <p className="text-[#36DD56]">{fileContent.expired}</p>
                      </div>
                      <div className="flex">
                        <p className="font-bold">ProductID :</p>
                        &nbsp;
                        <p className="font-medium">{fileContent.productId}</p>
                      </div>
                      <div className="flex">
                        <p className="font-bold">Owner Address :</p>
                        &nbsp;
                        <p className="font-medium">
                          {fileContent.ownerAddress.slice(0, 6)}...
                          {fileContent.ownerAddress.slice(-4)}
                        </p>
                      </div>
                      <div className="flex">
                        <p className="font-bold">Dealer Address :</p>
                        &nbsp;
                        <p className="font-medium">
                          {fileContent.dealerAddress.slice(0, 6)}...
                          {fileContent.dealerAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="border mt-4 border-[#CBD0DC] rounded-lg py-2 px-4 text-[#54575C]">
                    Contact Us
                  </button>
                </div>
              )}
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
