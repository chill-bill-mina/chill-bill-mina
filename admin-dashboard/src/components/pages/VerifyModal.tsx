import { GetPurchaseResponse } from "@/types/purchase";
import { useState } from "react";

export const VerifyModal = (purchase: GetPurchaseResponse) => {
  const [state, setState] = useState<"init" | "sell">("init");

  const sellHandler = () => {};

  const initHandler = () => {};

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-10 pointer-events-none"></div>
      <div className="bg-[#D9D9D9] p-20 flex flex-col items-center gap-y-8 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        {state === "init" ? <InitModal {...purchase} /> : <SellModal />}
        <div className="flex items-center gap-x-[180px]">
          <div className="flex flex-col items-center">
            <button
              onClick={() => setState("init")}
              className={`w-10 h-10 flex items-center justify-center rounded-full before:content-[''] relative before:absolute before:left-10 before:w-[100px] before:h-[1px] before:bg-[#979797] ${
                state === "init"
                  ? "bg-[#71B5DC] text-white"
                  : "bg-transparent border border-black"
              }`}
            >
              1
            </button>
            <span>İnitialize</span>
          </div>
          <div className="flex flex-col items-cente">
            <button
              onClick={() => setState("sell")}
              className={`w-10 h-10 flex items-center justify-center rounded-full before:content-[''] relative before:absolute before:right-10 before:w-[100px] before:h-[1px] before:bg-[#979797] ${
                state === "sell"
                  ? "bg-[#71B5DC] text-white"
                  : "bg-transparent border border-black"
              }`}
            >
              2
            </button>
            <span>Sell</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (state === "init") initHandler();
            else sellHandler();
          }}
          className="bg-[#71B5DC] w-1/2 p-4 text-white rounded-lg"
        >
          {state === "init" ? "İnitialize" : "Sell"}
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
      <div className="flex items-center justify-between">
        <p className="font-semibold">Owner Address</p>
        <p>{purchase.ownerAddress}</p>
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

const SellModal = () => {
  return <div>SellModal</div>;
};
