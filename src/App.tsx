import React, { forwardRef, useRef } from "react";
import Emoji from "./components/Emoji";

const SlotRoll = forwardRef<HTMLDivElement, { n: number }>(({ n }, ref) => {
  return (
    <div ref={ref} className="flex gap-8 flex-col items-center">
      {[...Array(n)].map((_, idx) => (
        <Emoji key={idx} />
      ))}
    </div>
  );
});

// considering 10 items in a SlotRoll
const N = 10;
function App() {
  const roll1Ref = useRef<HTMLDivElement>(null);
  const roll2Ref = useRef<HTMLDivElement>(null);
  const roll3Ref = useRef<HTMLDivElement>(null);

  const initPositionRolls = () => {
    const h = roll1Ref.current!.getBoundingClientRect().height;
    const itemH = roll1Ref.current!.children[0].getBoundingClientRect().height;
    const gap = (h - itemH * 10) / (N - 1);

    const rolls = [roll1Ref, roll2Ref, roll3Ref];
    rolls.forEach((r) => {
      const rand = ~~(Math.random() * (N - 3));
      const offset = rand * (itemH + gap);
      r.current?.animate(
        [
          { transform: "translateY(0px)" },
          { transform: `translateY(${-offset + gap / 2}px)` },
        ],
        { fill: "forwards", duration: 100 * rand, easing: "ease" }
      );
    });
  };

  return (
    <div className="bg-bg h-full text-textMain">
      <div className="flex flex-col justify-center items-center h-full">
        <div className="relative h-[14rem] w-[18rem] border-[#804545] border-2 grid grid-cols-3 overflow-hidden">
          <SlotRoll ref={roll1Ref} n={N} />
          <div className="slit w-[2px] h-[14rem] absolute left-1/3 top-1/2 -translate-y-1/2"></div>
          <SlotRoll ref={roll2Ref} n={N} />
          <div className="slit w-[2px] h-[14rem] absolute right-1/3 top-1/2 -translate-y-1/2"></div>
          <SlotRoll ref={roll3Ref} n={N} />
        </div>
        <div className="h-10"></div>
        <button onClick={initPositionRolls}>ka-ching</button>
      </div>
    </div>
  );
}

export default App;
