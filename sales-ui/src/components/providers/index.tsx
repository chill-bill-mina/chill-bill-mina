"use client";
import { Provider } from "react-redux";

import { store } from "@/redux/store";
import { MainLayout } from "./MainLayout";

const Providers = ({
  children,
  publicKey,
  token,
}: {
  children: React.ReactNode;
  publicKey?: string;
  token?: string;
}) => {
  return (
    <Provider store={store}>
      <MainLayout publicKey={publicKey} token={token}>
        {children}
      </MainLayout>
    </Provider>
  );
};

export default Providers;
