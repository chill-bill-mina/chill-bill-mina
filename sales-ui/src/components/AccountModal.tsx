"use client";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useAppSelector } from "@/types/state";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const AccountModal = () => {
  const { token } = useAppSelector((state) => state.session);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMyProducts = () => {
    router.push("/my-products");
    handleClose();
  };

  const ref = useOutsideClick(handleClose);

  if (!token) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={toggleOpen} className="font-medium text-xl">
        Account
      </button>
      {isOpen && (
        <div className="absolute top-12 left-0 bg-white border-2 border-black z-40">
          <button
            onClick={handleMyProducts}
            className="px-4 py-3 border-b-2 border-black text-nowrap"
          >
            My Products
          </button>
          <button className="px-4 py-3">Profile</button>
        </div>
      )}
    </div>
  );
};
