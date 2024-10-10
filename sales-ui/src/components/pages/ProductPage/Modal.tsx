export const Modal = () => {
  const generate = () => {
    //TODO
  };
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-10 pointer-events-none"></div>
      <div className="bg-[#D9D9D9] p-20 flex flex-col items-center fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <h2 className="text-2xl text-nowrap">
          Please select the documents you would like to receive.
        </h2>
        <div className="border border-black mt-8 w-full flex items-center p-4 rounded-lg gap-x-4">
          <input type="checkbox" checked />
          <p>Warranty Certificate</p>
        </div>
        <button
          onClick={generate}
          className="bg-[#027BC0] bg-opacity-50 mt-8 text-white px-4 py-2"
        >
          Generate Document
        </button>
      </div>
    </>
  );
};
