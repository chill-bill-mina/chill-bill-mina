"use client";
import { useQuery } from "@/hooks/useQuery";
import { GetPurchaseResponse } from "@/types/purchase";
import { useAppSelector } from "@/types/state";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { VerifyModal } from "./VerifyModal";

export const PurchasesPage = () => {
  const { postData } = useQuery();
  const [openModalP, setOpenModalP] = useState<GetPurchaseResponse | null>(
    null
  );
  const [purchases, setPurchases] = useState<GetPurchaseResponse[]>([]);
  const { token } = useAppSelector((state) => state.session);

  useEffect(() => {
    if (!token) return;
    postData(`/api/admin/purchases`, { token }).then((res) => {
      setPurchases(res?.purchases || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="px-12 mt-8">
      <div className="p-2 w-full flex items-center justify-between">
        <h1 className="text-4xl">Pending Purchases</h1>
      </div>
      <table className="w-full mt-10">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Product ID</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Sale Date</th>
            <th>Owner</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr
              key={purchase?.purchaseId}
              className="border-t border-[#D9D9D9]"
            >
              <td className="p-5 flex items-center justify-center">
                <Image
                  src={purchase.imageUrl}
                  alt={purchase.productID}
                  width={72}
                  height={72}
                />
              </td>
              <td className="text-center">{purchase.productName}</td>
              <td className="text-center">#{purchase.productID}</td>
              <td className="text-center">{purchase.price}$</td>
              <td className="text-center">{purchase.quantity}</td>
              <td className="text-center">
                {new Date(purchase.saleDate).toLocaleDateString()}
              </td>
              <td className="text-center">{purchase.ownerName}</td>
              <td>
                <div className="flex items-center justify-center">
                  <button
                    disabled={openModalP !== null}
                    onClick={() => setOpenModalP(purchase)}
                    className={`bg-[#71B5DC] text-lg px-4 text-white py-1 `}
                  >
                    Verify
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openModalP && (
        <VerifyModal purchase={openModalP} setOpenModalP={setOpenModalP} />
      )}
    </div>
  );
};
