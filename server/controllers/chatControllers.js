import { getAIResponse } from "../services/aiService.js";

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await getAIResponse(message);

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};