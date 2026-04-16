import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getAIResponse = async (message) => {
  try {
    const result = await model.generateContent(message);
    return result.response.text();
  } catch (error) {
    console.error("AI ERROR:", error);
    throw error;
  }
};