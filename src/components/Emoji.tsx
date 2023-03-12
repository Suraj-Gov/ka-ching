import React, { memo } from "react";
import twemoji from "twemoji";

interface props {
  emoji?: string;
  size?: string;
}

const getRandomEmoji = (): string => {
  // prettier-ignore
  const list = ['⚠️', '😎', '💡', '😂', '👍🏻', '🎉', '🦾', '📝', '🤧', '🥳', '😺']
  const n = list.length;
  const r = ~~(Math.random() * n);
  const emoji = list.at(r)!;
  return emoji;
};

const Emoji: React.FC<props> = ({ emoji, size = "2.5rem" }) => {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: "auto",
        maxHeight: size,
      }}
      dangerouslySetInnerHTML={{
        __html: twemoji.parse(emoji ?? getRandomEmoji(), {
          folder: "svg",
          ext: ".svg",
        }),
      }}
    />
  );
};

export default memo(Emoji);
