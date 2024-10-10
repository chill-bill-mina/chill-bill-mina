import type { Metadata } from "next";
import "./globals.css";

import { Roboto_Slab } from "next/font/google";
import Providers from "@/components/providers";
import { cookies } from "next/headers";

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
  const publicKey = cookies().get("publicKey");

  const token = cookies().get("token");

  return (
    <html lang="en">
      <body className={`${robotoSlab.className} antialiased`}>
        <Providers publicKey={publicKey?.value} token={token?.value}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
