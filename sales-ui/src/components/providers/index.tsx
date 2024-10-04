"use client";
import { Provider } from "react-redux";

import { store } from "@/redux/store";
import { MainLayout } from "./MainLayout";

const Providers = ({
  children,
  publicKey,
}: {
  children: React.ReactNode;
  publicKey?: string;
}) => {
  return (
    <Provider store={store}>
      <MainLayout publicKey={publicKey}>{children}</MainLayout>
    </Provider>
  );
};

export default Providers;
