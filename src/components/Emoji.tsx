import React, { memo } from "react";
import twemoji from "twemoji";

interface props {
  emoji: string;
  size?: string;
}

const Emoji: React.FC<props> = ({ emoji, size = "2.5rem" }) => {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
      }}
      dangerouslySetInnerHTML={{
        __html: twemoji
          .parse(emoji, {
            folder: "svg",
            ext: ".svg",
          })
          .replace(
            "twemoji.maxcdn.com/v",
            "cdnjs.cloudflare.com/ajax/libs/twemoji"
          ),
      }}
    />
  );
};

export default memo(Emoji);
