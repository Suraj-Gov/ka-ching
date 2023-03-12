import React, { forwardRef, useEffect, useRef, useState } from "react";
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

const N = 300;
function App() {
  const rollRef = useRef<HTMLDivElement>(null);
  const roll1Ref = useRef<HTMLDivElement>(null);
  const roll2Ref = useRef<HTMLDivElement>(null);
  const roll3Ref = useRef<HTMLDivElement>(null);

  const [rollDimensions, setRollDimensions] = useState({
    itemH: 0,
    gap: 0,
    rollH: 0,
  });

  useEffect(() => {
    const getSizes = () => {
      const h = rollRef.current!.getBoundingClientRect().height;
      const itemH = rollRef.current!.children[0].getBoundingClientRect().height;
      const gap = (h - itemH * N) / (N - 1);
      setRollDimensions({ itemH, gap, rollH: h });
    };
    setTimeout(getSizes, 100);
  }, []);

  const initPositionRolls = (args: typeof rollDimensions) => {
    const { gap, itemH, rollH } = args;

    const rolls = [roll1Ref, roll2Ref, roll3Ref];
    const offsets = rolls.map((r) => {
      const prevOffset = Number(r.current!.dataset?.offset ?? 0);
      const rand = ~~(Math.random() * 10);
      let offset = rand * (itemH + gap);
      if (!prevOffset) {
        offset -= gap / 2;
      }
      const newOffset = offset + prevOffset;
      console.log(rand, offset, newOffset);
      return {
        rand,
        newOffset,
      };
    });
    // console.log(offsets);
    // const duration = 500 * Math.max(...offsets.map((i) => i.rand));

    rolls.forEach((r, idx) => {
      const offset = offsets[idx].newOffset;
      const duration = 500 * offsets[idx].rand;

      const keyframes = [
        { transform: "translateY(0px)" },
        { transform: `translateY(${-offset - 10}px)` },
        { transform: `translateY(${-offset}px)` },
      ];
      const commonAnimationConfig: KeyframeAnimationOptions = {
        easing: "ease",
        fill: "forwards",
      };

      r.current!.animate(keyframes.slice(0, 2), {
        ...commonAnimationConfig,
        duration,
      }).addEventListener("finish", () => {
        r.current?.animate(keyframes.slice(1, 3), {
          ...commonAnimationConfig,
          duration: 100,
        });
      });
      r.current!.dataset.offset = String(offset);
    });
  };

  return (
    <div className="bg-bg h-full text-textMain">
      <div className="flex flex-col justify-center items-center h-full">
        <div className="relative h-[14rem] w-[18rem] border-[#804545] border-2 grid grid-cols-3 overflow-hidden">
          <div ref={roll1Ref}>
            <SlotRoll ref={rollRef} n={N} />
          </div>
          <div className="slit w-[2px] h-[14rem] absolute left-1/3 top-1/2 -translate-y-1/2"></div>
          <div ref={roll2Ref}>
            <SlotRoll n={N} />
          </div>
          <div className="slit w-[2px] h-[14rem] absolute right-1/3 top-1/2 -translate-y-1/2"></div>
          <div ref={roll3Ref}>
            <SlotRoll n={N} />
          </div>
        </div>
        <div className="h-10"></div>
        <button onClick={() => initPositionRolls(rollDimensions)}>
          ka-ching
        </button>
        <pre>{JSON.stringify(rollDimensions)}</pre>
      </div>
    </div>
  );
}

export default App;
