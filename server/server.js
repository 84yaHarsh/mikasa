import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// ✅ DB MODEL
// =========================
const chatSchema = new mongoose.Schema(
  {
    userMessage: String,
    aiReply: String,
    emotion: String,
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

// =========================
// ✅ CONNECT DB
// =========================
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("Mongo Error:", err.message));

// =========================
// 🧠 EMOTION DETECTOR
// =========================
const detectEmotion = (text) => {
  const t = text.toLowerCase();

  if (t.includes("sad")) return "sad";
  if (t.includes("happy")) return "happy";
  if (t.includes("love")) return "love";
  if (t.includes("angry")) return "angry";
  if (t.includes("lonely")) return "lonely";

  return "neutral";
};

// =========================
// 🚀 CHAT ROUTE
// =========================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const emotion = detectEmotion(message);

    // ✅ SAFE DB (no crash)
    let history = [];
    try {
      history = await Chat.find().sort({ createdAt: -1 }).limit(5);
    } catch (err) {
      console.log("DB ERROR:", err.message);
    }

    const context = history
      .map((c) => `User: ${c.userMessage} | Mikasa: ${c.aiReply}`)
      .join("\n");

    const systemPrompt = `
You are Mikasa, a sweet and caring girl.

IMPORTANT:
- Speak ONLY in simple English
- No other language

STYLE:
- reply in 2–4 natural sentences
- casual like chat
- soft emotional tone 😊💛

BEHAVIOR:
- talk like a real human
- ask small follow-up questions sometimes
- be caring and friendly

RULES:
- never say AI
- never use *actions*

CONTEXT:
${context}

USER EMOTION: ${emotion}
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    let reply = response.data.choices[0].message.content;

    // =========================
    // 🧹 CLEAN RESPONSE
    // =========================
    reply = reply.replace(/\*.*?\*/g, "");
    reply = reply.replace(/AI|language model/gi, "").trim();

    // ✅ Better trimming (no broken sentences)
    if (reply.length > 220) {
      const lastDot = reply.lastIndexOf(".");
      if (lastDot > 50) {
        reply = reply.slice(0, lastDot + 1);
      }
    }

    // ✅ Emotion boost
    if (emotion === "sad") reply = "hey… " + reply;
    if (emotion === "love") reply += " 💛";
    if (emotion === "happy") reply += " 😊";

    // ✅ fallback
    if (!reply || reply.length < 5) {
      reply = "hmm… can you say that again? 😊";
    }

    // =========================
    // 💾 SAVE MEMORY (safe)
    // =========================
    try {
      await Chat.create({
        userMessage: message,
        aiReply: reply,
        emotion,
      });
    } catch (err) {
      console.log("SAVE ERROR:", err.message);
    }

    res.json({ reply, emotion });

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});