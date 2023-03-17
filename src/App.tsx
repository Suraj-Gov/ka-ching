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
import SlotRoll from "./components/SlotRoll";

const N = 10;

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

  const [isLoadingDone, setIsLoadingDone] = useState(false);
  useEffect(() => {
    // set state on image load complete
    const allImages = document.querySelectorAll("img");
    const totalImages = allImages.length;
    let loadedImagesCount = 0;
    const registerOnLoad = () => {
      loadedImagesCount++;
      if (loadedImagesCount === totalImages) {
        setIsLoadingDone(true);
      }
    };
    allImages.forEach((i) => {
      if (i.complete) {
        registerOnLoad();
      } else {
        i.onload = registerOnLoad;
      }
    });
  }, []);

  const isReady = rollDimensions.itemH > 0 && isLoadingDone;

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const hasNoChildren = !rollRef.current?.childElementCount;
    if (hasNoChildren || isReady) {
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
    shouldRoll = true /** set false if only to align to next item in slot roll */,
    idx?: number
  ) => {
    setIsAnimating(true);
    const { gap, itemH } = args;

    const offsets = rolls.map((r, idx) => {
      const prevOffset = Number(getData(r.current!, "offset") ?? 0);
      let rand = shouldRoll ? getRandomNum() : idx + 1;
      rand = Math.max(1, rand); // always move atleast once
      let offset = rand * (itemH + gap);
      if (!prevOffset) {
        // on init, do not stick at top
        offset -= gap / 2;
      }
      const newOffset = offset + prevOffset;
      return {
        rand,
        newOffset,
        prevOffset,
      };
    });

    const endRollAnimation = async (idx: number) => {
      const r = rolls[idx];
      const { newOffset, prevOffset, rand } = offsets[idx];
      const offset = newOffset;
      const duration = ANIM_SPEED * 1.5 * rand;

      const keyframes = [
        { transform: `translateY(${-prevOffset}px)` },
        { transform: `translateY(${-offset - 10}px)` },
        { transform: `translateY(${-offset}px)` },
      ];
      const spinToRandItemPos = keyframes.slice(0, 2);
      const jerkToLockItemPos = keyframes.slice(1, 3);

      const commonAnimationConfig: KeyframeAnimationOptions = {
        easing: "ease-out",
        fill: "forwards",
      };

      const anim = syncAnimate(r.current!);
      await anim(spinToRandItemPos, {
        ...commonAnimationConfig,
        duration,
      });
      const isAnimationComplete = idx === 2;
      if (isAnimationComplete) {
        // end animation before the last tick
        setIsAnimating(false);
      }
      await anim(jerkToLockItemPos, {
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
        backgroundColor: isAnimating ? "#120707" : "#1b0a0a",
        ...containerTransitions,
      }}
      className="h-full text-textMain bg-[#1b0a0a]"
    >
      <div className="flex flex-col justify-center items-center h-full">
        <div
          className="border-[#804545] border-2 rounded-md"
          style={{
            overflow: "hidden",
            transform: `translateY(${isAnimating ? -1 : 0}rem)`,
            ...containerTransitions,
          }}
        >
          <div
            style={{
              opacity: isReady ? 1 : 0,
            }}
            className="relative h-[14rem] w-[18rem]  grid grid-cols-3 transition-all duration-500"
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
          <div
            style={{ boxShadow: "inset 0px 20px 40px 6px black" }}
            className="absolute top-0 z-10 h-[14rem] w-[18rem]"
          ></div>
          <div
            style={{ boxShadow: "inset 0px -20px 40px 6px black" }}
            className="absolute top-0 z-10 h-[14rem] w-[18rem]"
          ></div>
        </div>

        <div className="h-10"></div>
        <button
          className="z-10 transition-all bg-white bg-opacity-0 hover:bg-opacity-10 active:bg-opacity-5 hover:-translate-y-1 active:translate-y-1 px-4 py-2 rounded-md disabled:opacity-30 border-red-200 border-opacity-10 border-2"
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
