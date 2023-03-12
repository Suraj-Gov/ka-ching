import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Emoji from "./components/Emoji";
import { getRandomEmoji } from "./utils";

const SlotRoll = forwardRef<HTMLDivElement, { n: number }>(({ n }, ref) => {
  const [icons] = useState(() => {
    return [...Array(n)].map((_, idx) => {
      const emoji = getRandomEmoji();
      return <Emoji emoji={emoji} key={idx} />;
    });
  });

  return (
    <div className="flex flex-col gap-8">
      <div ref={ref} className="flex gap-8 flex-col items-center">
        {icons}
      </div>
      <div className="flex gap-8 flex-col items-center">{icons}</div>
    </div>
  );
});

// considering 10 items in a SlotRoll

const N = 6;
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

  const isReady = rollDimensions.itemH > 0;

  useEffect(() => {
    if (!rollRef.current?.childElementCount || isReady) {
      return;
    }

    let timeoutId = 0;
    const getSizes = () => {
      const h = rollRef.current!.getBoundingClientRect().height;
      const itemH = rollRef.current!.children[0].getBoundingClientRect().height;
      const gap = (h - itemH * N) / (N - 1);
      setRollDimensions({ itemH, gap, rollH: h });
      spinSlotRolls({ itemH, gap, rollH: h }, false);
      clearTimeout(timeoutId);
    };
    timeoutId = setTimeout(getSizes, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [rollRef.current?.childElementCount]);

  const spinSlotRolls = (args: typeof rollDimensions, shouldRoll = true) => {
    const { gap, itemH, rollH } = args;

    const rolls = [roll1Ref, roll2Ref, roll3Ref];
    const offsets = rolls.map((r, idx) => {
      const prevOffset = Number(r.current!.dataset?.offset ?? 0);
      let rand = shouldRoll ? ~~(Math.random() * 10) : idx + 1;
      rand = Math.max(1, rand); // always move atleast once
      let offset = rand * (itemH + gap);
      if (!prevOffset) {
        offset -= gap / 2;
      }
      const newOffset = offset + prevOffset;
      console.log(rand, offset, newOffset);
      return {
        rand,
        newOffset,
        prevOffset,
      };
    });
    // console.log(offsets);
    // const duration = 500 * Math.max(...offsets.map((i) => i.rand));

    rolls.forEach((r, idx) => {
      const { newOffset, prevOffset, rand } = offsets[idx];
      const offset = newOffset;
      const duration = 500 * rand;

      const keyframes = [
        { transform: `translateY(${-prevOffset}px)` },
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
      r.current!.dataset.firstItemIdx = String(rand);
    });
  };

  return (
    <div className="bg-bg h-full text-textMain">
      <div className="flex flex-col justify-center items-center h-full">
        <div
          style={{ opacity: isReady ? 1 : 0 }}
          className="relative h-[14rem] w-[18rem] border-[#804545] border-2 grid grid-cols-3 transition-all"
        >
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
        <button
          className="z-10"
          disabled={!isReady}
          onClick={() => spinSlotRolls(rollDimensions)}
        >
          ka-ching
        </button>
      </div>
    </div>
  );
}

export default App;
