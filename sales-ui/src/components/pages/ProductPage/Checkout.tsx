import Image from "next/image";

import VisaIcon from "@/assets/svg/visa.svg";
import MınaIcon from "@/assets/svg/mina.svg";
import ChillBill from "@/assets/images/chillbill.png";

export const Checkout = ({ price }: { price: number }) => {
  return (
    <div className="flex items-start px-12 mt-10 mb-20">
      <div className="w-2/3 flex flex-col gap-y-8 pr-5">
        <ShippingAddress />
        <ContactInfo />
        <PaymentMethod />
        <PayWithMina />
      </div>
      <div className="w-1/3 flex flex-col pl-5">
        <BuyBox price={price} />
        <ShopWithConfidence />
      </div>
    </div>
  );
};

const BuyBox = ({ price }: { price: number }) => {
  return (
    <div className="p-10 bg-[#F0F0F0] rounded-2xl flex flex-col">
      <div className="flex flex-col gap-y-2 mb-6">
        <button
          className={`w-full bg-[#027BC0] h-[64px] rounded-lg bg-opacity-70 text-2xl text-white `}
        >
          Buy
        </button>
        <p>
          By signing your order, you agree to our company <b>Privacy policy</b>{" "}
          and <b>Conditions of use</b>.
        </p>
      </div>
      <div className="bg-[#808080] w-full h-[1px]"></div>
      <div className="flex flex-col gap-y-6 my-6">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <p className="text-base">Products</p>
            <p className="text-base">{price}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base">Shipping and handling:</p>
            <p className="text-base">5.50</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base">Before tax:</p>
            <p className="text-base">62.23</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base">Tax Collected:</p>
            <p className="text-base">8.21</p>
          </div>
        </div>
      </div>
      <div className="bg-[#808080] w-full h-[1px]"></div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-xl">Order Total:</p>
        <p className="text-xl">{price + 5.5 + 62.23 + 8.21}</p>
      </div>
    </div>
  );
};

const ShopWithConfidence = () => {
  return (
    <div className="p-10 bg-[#F0F0F0] rounded-2xl flex flex-col gap-y-4 mt-8">
      <h2 className="text-3xl">Shop with confidence</h2>
      <p>
        Shop securely with Mina, no need to share your data away. Own it all,
        make it stay – your privacy, every day!
      </p>
      <div className="flex items-center gap-x-1">
        <span className="text-base">Powered By</span>
        <Image src={ChillBill} alt="ChillBill" />
      </div>
    </div>
  );
};

const ShippingAddress = () => {
  return (
    <div className="flex flex-col">
      <h4 className="font-roboto-slab text-2xl">Shipping Address</h4>
      <div className="mt-6 border border-[#71B5DC] rounded-lg p-10 flex flex-col gap-y-6">
        <div className="flex items-center gap-x-4">
          <input type="checkbox" className="w-5 h-5" checked disabled />
          <p className="text-xl">Delivery and Billing Address</p>
        </div>
        <div className="flex items-center gap-x-8">
          <label htmlFor="">
            <span>First Name</span>
            <input
              type="text"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="John"
            />
          </label>
          <label htmlFor="">
            <span>Last Name</span>
            <input
              type="text"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="Doe"
            />
          </label>
        </div>
        <div>
          <label htmlFor="">
            <span>Street Address</span>
            <input
              type="text"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="1234 Main St"
            />
          </label>
        </div>
        <div className="flex items-center gap-x-4">
          <label htmlFor="">
            <span>Apt Number</span>
            <input
              type="text"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="Apt 123"
            />
          </label>
          <label htmlFor="">
            <span>State</span>
            <input
              type="text"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="NY"
            />
          </label>
          <label htmlFor="">
            <span>Zip</span>
            <input
              type="text"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="12345"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

const ContactInfo = () => {
  return (
    <div className="flex flex-col">
      <h4 className="font-roboto-slab text-2xl">Contact Information</h4>
      <div className="mt-6 border border-[#71B5DC] rounded-lg p-10 flex flex-col gap-y-6">
        <label htmlFor="">
          <span>E-mail</span>
          <input
            type="text"
            className="w-full border border-[#71B5DC] rounded-lg p-2"
            disabled
            defaultValue="johndoe@gmail.com"
          />
        </label>
        <label htmlFor="">
          <span>Phone Number</span>
          <input
            type="text"
            className="w-full border border-[#71B5DC] rounded-lg p-2"
            disabled
            defaultValue="123-456-7890"
          />
        </label>
      </div>
    </div>
  );
};

const PaymentMethod = () => {
  return (
    <div className="flex flex-col">
      <h4 className="font-roboto-slab text-2xl">Payment Method</h4>
      <div className="mt-6 border border-[#71B5DC] rounded-lg p-10 flex flex-col gap-y-6">
        <div className="flex items-center gap-x-4">
          <input type="checkbox" className="w-5 h-5" checked disabled />
          <p className="text-xl">Credit or Debit card</p>
        </div>
        <label htmlFor="" className="relative">
          <input
            type="text"
            className="w-full border border-[#71B5DC] rounded-lg p-2"
            disabled
            defaultValue="1234 5678 9012 3456"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Image src={VisaIcon} alt="Visa Icon" width={40} height={40} />
          </div>
        </label>
        <div className="flex items-center gap-x-3 w-2/3">
          <label htmlFor="">
            <input
              type="text"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="04 / 24"
            />
          </label>
          <label htmlFor="">
            <input
              type="password"
              className="w-full border border-[#71B5DC] rounded-lg p-2"
              disabled
              defaultValue="123"
            />
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <input type="checkbox" className="w-3 h-3" checked disabled />
          <p className="text-base">Save this credit card for later use</p>
        </div>
      </div>
    </div>
  );
};

const PayWithMina = () => {
  return (
    <div className="rounded-lg flex items-center justify-between shadow-lg border border-white border-opacity-50 p-10">
      <div className="flex items-center gap-x-2">
        <input type="checkbox" className="w-4 h-4" disabled />
        <p className="text-xl">Pay with Mina</p>
      </div>
      <div className="flex items-center gap-x-2">
        <p className="text-xl">...soon</p>
        <Image src={MınaIcon} alt="Mina Icon" width={40} height={40} />
      </div>
    </div>
  );
};
