export const detectEmotion = (text) => {
  text = text.toLowerCase();

  if (text.includes("sad") || text.includes("tired")) return "sad";
  if (text.includes("happy") || text.includes("great")) return "happy";
  if (text.includes("angry") || text.includes("frustrated")) return "angry";

  return "neutral";
};