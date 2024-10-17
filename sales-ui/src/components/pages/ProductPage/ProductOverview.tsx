/* eslint-disable @typescript-eslint/no-explicit-any */
export const ProductOverview = ({ features }: { features: any }) => {
  if (!features) return null;
  const numberOfElements = Object.keys(features).length;
  return (
    <div className="mt-[100px]">
      <h2 className="text-black text-3xl font-semibold">Technical Overview</h2>
      <div className="flex flex-wrap mt-8">
        {Object.keys(features).map((key: string, index: number) => (
          <div
            key={index}
            className={`px-8 ${
              index !== numberOfElements - 1 ? "border-r border-[#D9D9D9]" : ""
            }`}
          >
            <div className="text-2xl font-bold">{key}</div>
            <div className="text-lg text-gray-600">{features[key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
