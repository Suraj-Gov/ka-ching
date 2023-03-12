import React, { forwardRef } from "react";
import Emoji from "./components/Emoji";

const SlotRoll = forwardRef<HTMLDivElement, { n: number }>(({ n }, ref) => {
  return (
    <div ref={ref} className="flex gap-8 flex-col items-center">
      {[...Array(n)].map((_) => (
        <Emoji />
      ))}
    </div>
  );
});

function App() {
  return (
    <div className="bg-bg h-full">
      <div className="flex justify-center items-center h-full">
        <div
          style={{ aspectRatio: "3 / 2" }}
          className="max-w-xs w-full border-gray-50 border-2 grid grid-cols-3 place-items-center overflow-hidden"
        >
          <SlotRoll n={5} />
          <SlotRoll n={5} />
          <SlotRoll n={5} />
        </div>
      </div>
    </div>
  );
}

export default App;
