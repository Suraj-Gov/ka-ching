import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Emoji from "./components/Emoji";
import { getData, getRandomEmoji, setData, syncAnimate } from "./utils";

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

const N = 20;

const ANIM_SPEED = 300;

const getRandomNum = () => {
  const n = ~~(Math.random() * (N - 3));
  return n;
};

function App() {
  const rollRef = useRef<HTMLDivElement>(null);

  const roll1Ref = useRef<HTMLDivElement>(null);
  const roll2Ref = useRef<HTMLDivElement>(null);
  const roll3Ref = useRef<HTMLDivElement>(null);
  const rolls = [roll1Ref, roll2Ref, roll3Ref];

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

  const spinSlotRolls = (
    args: typeof rollDimensions,
    shouldRoll = true,
    idx?: number
  ) => {
    const { gap, itemH, rollH } = args;

    const offsets = rolls.map((r, idx) => {
      const prevOffset = Number(getData(r.current!, "offset") ?? 0);
      let rand = shouldRoll ? getRandomNum() : idx + 1;
      rand = Math.max(1, rand); // always move atleast once
      let offset = rand * (itemH + gap);
      if (!prevOffset) {
        offset -= gap / 2;
      }
      const newOffset = offset + prevOffset;
      return {
        rand,
        newOffset,
        prevOffset,
      };
    });
    // const duration = 500 * Math.max(...offsets.map((i) => i.rand));

    const endRollAnimation = async (idx: number) => {
      const r = rolls[idx];
      const { newOffset, prevOffset, rand } = offsets[idx];
      const offset = newOffset;
      const duration = ANIM_SPEED * 2 * rand;

      const keyframes = [
        { transform: `translateY(${-prevOffset}px)` },
        { transform: `translateY(${-offset - 10}px)` },
        { transform: `translateY(${-offset}px)` },
      ];

      const commonAnimationConfig: KeyframeAnimationOptions = {
        easing: "ease-out",
        fill: "forwards",
      };

      const anim = syncAnimate(r.current!);
      await anim(keyframes.slice(0, 2), {
        ...commonAnimationConfig,
        duration,
      });
      await anim(keyframes.slice(1, 3), {
        ...commonAnimationConfig,
        duration: ANIM_SPEED,
      });
      setData(r.current!, "offset", offset);
      setData(r.current!, "lastStopIdx", rand);
    };

    if (idx !== undefined) {
      endRollAnimation(idx);
    } else {
      rolls.forEach((_, idx) => {
        endRollAnimation(idx);
      });
    }
  };

  const keepRolling = (
    args: typeof rollDimensions,
    completeAfterIterations: number
  ) => {
    const { rollH, gap, itemH } = args;

    rolls.forEach(async (r, idx) => {
      const anim = syncAnimate(r.current!);

      let initYPos = Number(getData(r.current!, "offset") ?? 0);
      let fromPos = -initYPos;
      let keyframeFrom = { transform: `translateY(${fromPos}px)` };

      const duration = 0.6 * N * ANIM_SPEED + idx * ANIM_SPEED * 0.5;

      const lastStopIdx = Number(getData(r.current!, "lastStopIdx") ?? 0);
      const shouldReset = idx + 1 - lastStopIdx !== 0;
      if (shouldReset) {
        const tillRollEnd = (duration / N) * (N - lastStopIdx);
        await anim(
          [keyframeFrom, { transform: `translateY(${-rollH - gap}px)` }],
          {
            duration: tillRollEnd,
            fill: "forwards",
          }
        );
        r.current!.style.transform = `translateY(0px)`;
        initYPos = 0;
        setData(r.current!, "offset", 0);
        keyframeFrom.transform = `translateY(0px)`;
      }

      const toPos = -rollH - initYPos - gap;

      const keyframes = [keyframeFrom, { transform: `translateY(${toPos}px)` }];
      await anim(keyframes, {
        iterations: completeAfterIterations + idx,
        fill: "forwards",
        duration,
      });
      r.current!.style.transform = keyframes[0].transform;
      spinSlotRolls(args, true, idx);
    });
  };

  return (
    <div className="bg-bg h-full text-textMain">
      <div className="flex flex-col justify-center items-center h-full">
        <div
          style={{ overflow: "hidden", opacity: isReady ? 1 : 0 }}
          className="relative h-[14rem] w-[18rem] border-[#804545] border-2 grid grid-cols-3 transition-all rounded-md"
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
          onClick={() => keepRolling(rollDimensions, 1)}
        >
          ka-ching ✨
        </button>
      </div>
    </div>
  );
}

export default App;
