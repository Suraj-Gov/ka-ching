export const getRandomEmoji = (): string => {
  // prettier-ignore
  const list = ['⚠️', '😎', '💡', '😂', '👍🏻', '🎉', '🦾', '📝', '🤧', '🥳', '😺']
  const n = list.length;
  const r = ~~(Math.random() * n);
  const emoji = list.at(r)!;
  return emoji;
};
