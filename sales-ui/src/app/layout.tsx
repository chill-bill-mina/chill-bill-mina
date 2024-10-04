import type { Metadata } from "next";
import "./globals.css";

import { Roboto_Slab } from "next/font/google";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chill Bill",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoSlab.className} antialiased`}>{children}</body>
    </html>
  );
}
