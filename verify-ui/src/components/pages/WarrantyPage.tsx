import { UploadFile } from "./UploadFile";

export const WarrantyPage = () => {
  return (
    <div className="flex-1 flex relative max-h-full">
      <div className="w-2/3 h-full flex flex-col items-center">
        <div className="w-full p-10">
          <p className="text-[48px] font-bold">
            Upload the file containing the ZK proof.
          </p>
        </div>
        <UploadFile />
      </div>

      <div className="w-1/3 h-full relative">
        <div
          className="absolute inset-0 z-[-1]"
          style={{
            backgroundImage: "url('/assets/warranty-cover.png')",
            backgroundSize: "cover",
            backgroundPosition: "top",
            height: "100%",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
    </div>
  );
};
