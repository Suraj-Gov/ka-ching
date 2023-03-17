import { forwardRef, useState } from "react";
import { getRandomEmoji } from "../utils";
import Emoji from "./Emoji";

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

export default SlotRoll;
