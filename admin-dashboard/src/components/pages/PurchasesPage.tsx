"use client";
import { useQuery } from "@/hooks/useQuery";
import { GetPurchaseResponse } from "@/types/purchase";
import { useAppSelector } from "@/types/state";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { VerifyModal } from "./VerifyModal";
import { useOutsideClick } from "../useOutsideClick";

export const PurchasesPage = () => {
  const { postData } = useQuery();

  const [openModal, setOpenModal] = useState<boolean>(false);

  const closeModal = () => {
    setOpenModal(false);
  };

  const [purchases, setPurchases] = useState<GetPurchaseResponse[]>([]);

  const ref = useOutsideClick(closeModal);

  useEffect(() => {
    setPurchases([
      {
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
        saleDate: "20230909",
        email: "keremkaya@gmail.com",
        phoneNumber: "+4545",
        productDescription: "This is a product description",
        vatAmount: 20,
        discountAmount: 10,
      },
    ]);
  }, []);

  const { token } = useAppSelector((state) => state.session);

  //   useEffect(() => {
  //     if (!token) return;
  //     postData(`/api/admin/purchases`, { token }).then((res) => {
  //       setPurchases(res.purchases);
  //     });
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [token]);
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
              <td className="text-center">{purchase.ownerName}</td>
              <td>
                <div ref={ref} className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      setOpenModal(true);
                    }}
                    className={`bg-[#71B5DC] text-lg px-4 text-white py-1 `}
                  >
                    Verify
                  </button>
                  {openModal && <VerifyModal {...purchase} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
