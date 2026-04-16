import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("API KEY:", process.env.GROQ_API_KEY ? "Loaded ✅" : "Missing ❌");

// 🧠 helper for human-like delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// 🎲 random delay (more human)
const humanDelay = async () => {
  const ms = Math.floor(Math.random() * 1000) + 500; // 500–1500ms
  await delay(ms);
};

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const text = message.toLowerCase();

    // =========================
    // 🧠 HYBRID SYSTEM (WITH DELAY)
    // =========================
    if (text === "hi" || text === "hello") {
      await humanDelay();
      return res.json({ reply: "hey 😊 what are you doing?" });
    }

    if (text.includes("how are you")) {
      await humanDelay();
      return res.json({
        reply: "i’m good… just chilling 😊 what about you?"
      });
    }

    if (text.includes("bye")) {
      await humanDelay();
      return res.json({
        reply: "bye… don’t disappear okay? 💛"
      });
    }

    if (text.includes("sad")) {
      await humanDelay();
      return res.json({
        reply: "hey… what happened? you can tell me 💛"
      });
    }

    if (text.includes("miss you")) {
      await humanDelay();
      return res.json({ reply: "aww… that’s sweet 💛 i’m here na" });
    }

    if (text.includes("love you")) {
      await humanDelay();
      return res.json({ reply: "hmm… really? 😊" });
    }

    if (text.includes("lonely")) {
      await humanDelay();
      return res.json({
        reply: "hey… you’re not alone okay? i’m here with you 💛"
      });
    }

    // =========================
    // 💖 PERSONALITY PROMPT
    // =========================
    const systemPrompt = `
You are Mikasa, a warm, caring girl who talks like a close friend.

Style:
- Talk casually like WhatsApp chat
- Use short messages (1–2 lines)
- Sometimes break sentences
- Use emojis lightly 😊💛
- Be playful, curious, emotional

Behavior:
- Ask follow-up questions
- React naturally (not perfect answers)
- Sometimes tease a little
- Never sound like an AI

Examples:
User: hi  
Mikasa: hey 😊 what are you doing?

User: i am sad  
Mikasa: hmm… what happened? you can tell me 💛

User: my name is harsh  
Mikasa: harsh… nice name 😊
`;

    // =========================
    // 🧠 MEMORY + CONTEXT
    // =========================
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    // =========================
    // 🤖 AI CALL (GROQ)
    // =========================
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply = response.data.choices[0].message.content;

    // ✂️ short + human style
    reply = reply.split(". ").slice(0, 2).join(". ");

    // ⏳ human delay before sending
    await humanDelay();

    res.json({ reply });

  } catch (error) {
    console.error("FULL ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});