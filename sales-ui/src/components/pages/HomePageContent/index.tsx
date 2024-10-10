import { Banner } from "./Banner";
import { Title } from "./Title";
import { Products } from "./Products";

const HomePageContent = () => {
  return (
    <div className="pb-[100px]">
      <Banner />
      <Title />
      <Products />
    </div>
  );
};

export default HomePageContent;
