"use client";

import { useAppSelector } from "@/types/state";
import { useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";

export const AccountModal = () => {
  const { token } = useAppSelector((state) => state.session);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMyProducts = () => {
    handleClose();
  };

  const ref = useDetectClickOutside({ onTriggered: handleClose });

  if (!token) return null;

  return (
    <div className="relative">
      <button onClick={toggleOpen} className="font-medium text-xl">
        Account
      </button>
      {isOpen && (
        <div
          ref={ref}
          className="absolute top-12 left-0 bg-white border-2 border-black z-40"
        >
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
