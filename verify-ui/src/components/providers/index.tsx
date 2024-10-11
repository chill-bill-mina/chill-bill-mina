import { Header } from "../Header";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Header />
      {children}
    </div>
  );
};

export default Providers;
