import { getAIResponse } from "../services/aiService.js";
import Chat from "../models/Chat.js";
import { detectEmotion } from "../utils/emotion.js";

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    // 🧠 detect emotion
    const emotion = detectEmotion(message);

    // 📚 get last 5 chats (memory)
    const history = await Chat.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const context = history
      .map((c) => `User: ${c.userMessage} | AI: ${c.aiReply}`)
      .join("\n");

    // 🤖 send context to AI
    const reply = await getAIResponse(message, context, emotion);

    // 💾 save chat
    await Chat.create({
      userMessage: message,
      aiReply: reply,
      emotion,
    });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};