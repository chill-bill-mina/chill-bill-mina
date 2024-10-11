"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const Header = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Products",
      href: "/products",
    },
    {
      name: "Dealers",
      href: "/dealers",
    },
    {
      name: "Warranty",
      href: "/warranty",
    },
    {
      name: "FAQ",
      href: "/faq",
    },
  ];
  return (
    <div className="px-12 py-8 flex items-center justify-between">
      <Link href="/">
        <h1 className="text-3xl text-[#F66B05] font-bold">Bill’s Company</h1>
      </Link>
      <nav>
        <ul className="flex space-x-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-3xl text-black font-bold hover:underline hover:text-[#F66B05] ${
                  item.href !== "/warranty" ? "pointer-events-none" : ""
                } ${pathname === item.href ? "text-[#F66B05]" : ""}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
