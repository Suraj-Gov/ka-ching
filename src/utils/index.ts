export const getRandomEmoji = (): string => {
  // Define the range of Unicode characters for emojis
  const emojiRange = [0x1f600, 0x1f64f];

  // Generate a random Unicode code point within the emoji range
  const randomCode =
    Math.floor(Math.random() * (emojiRange[1] - emojiRange[0] + 1)) +
    emojiRange[0];

  // Convert the Unicode code point to the corresponding emoji character
  const randomEmoji = String.fromCodePoint(randomCode);

  // Log the random emoji to the console
  return randomEmoji;
};

type keyType = "offset" | "lastStopIdx";

export const setData = (
  ref: HTMLDivElement,
  key: keyType,
  val: string | number
) => {
  if (typeof val === "number") {
    val = String(val);
  }
  ref.dataset[key] = val;
};
export const getData = (ref: HTMLDivElement, key: keyType): unknown => {
  return ref.dataset[key];
};

export const syncAnimate =
  (node: Element) =>
  (keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
    new Promise((resolve) => {
      node.animate(keyframes, options).addEventListener("finish", resolve);
    });
