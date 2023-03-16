import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!rollRef.current?.childElementCount || isReady) {
      return;
    }

    let timeoutId = 0;
    const getSizes = () => {
      setIsAnimating(true);
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
      if (idx === 2) {
        setIsAnimating(false);
      }
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
    setIsAnimating(true);
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

  const effectsEaseFn = isAnimating
    ? "cubic-bezier(0.22, 0.61, 0.36, 1)"
    : "cubic-bezier(0.18, 0.89, 0.32, 1.28)";

  const effectsDuration = `${ANIM_SPEED * (isAnimating ? 20 : 2)}ms`;

  const containerTransitions: CSSProperties = {
    transitionDuration: effectsDuration,
    transitionTimingFunction: effectsEaseFn,
  };

  return (
    <div
      style={{
        backgroundColor: isAnimating ? "#000000" : "#1b0a0a",
        ...containerTransitions,
      }}
      className="h-full text-textMain"
    >
      <div className="flex flex-col justify-center items-center h-full">
        <div
          style={{
            overflow: "hidden",
            transform: `translateY(${isAnimating ? -1 : 0}rem)`,
            ...containerTransitions,
          }}
        >
          <div
            style={{
              opacity: isReady ? 1 : 0,
              transition: "all 0.8s ease",
            }}
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
        </div>

        <div className="h-10"></div>
        <button
          className="z-10 transition-all bg-white bg-opacity-0 hover:bg-opacity-20 active:bg-opacity-10 hover:-translate-y-1 active:translate-y-1 px-4 py-2 rounded-md disabled:opacity-30"
          disabled={!isReady || isAnimating}
          onClick={() => keepRolling(rollDimensions, 1)}
        >
          ka-ching ✨
        </button>
      </div>
    </div>
  );
}

export default App;
