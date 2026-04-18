import { useState, useEffect } from "react";
import axios from "axios";
import Live2DAvatar from "./Live2DAvatar";

function App() {
  const [status, setStatus] = useState("idle");

  // =========================
  // 🎭 EMOTION (Apply on canvas globally)
  // =========================
  const applyEmotion = (emotion) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    canvas.style.transition = "all 0.3s ease";

    if (emotion === "happy") {
      canvas.style.filter = "brightness(1.2)";
    } else if (emotion === "sad") {
      canvas.style.filter = "grayscale(0.6)";
    } else if (emotion === "love") {
      canvas.style.filter = "drop-shadow(0 0 15px pink)";
    } else {
      canvas.style.filter = "none";
    }
  };

  // =========================
  // 🔊 LOAD VOICES
  // =========================
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  // =========================
  // 🎤 LISTEN
  // =========================
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome 😢");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setStatus("listening");
    };

    recognition.onresult = async (e) => {
      const text = e.results[0][0].transcript;

      setStatus("thinking");

      try {
        const res = await axios.post("http://localhost:5000/api/chat", {
          message: text,
        });

        const { reply, emotion } = res.data;

        applyEmotion(emotion);
        speak(reply);

      } catch (err) {
        console.error("API ERROR:", err);
        setStatus("idle");
      }
    };

    recognition.onerror = () => {
      setStatus("idle");
    };

    recognition.start();
  };

  // =========================
  // 🔊 SPEAK (BROWSER VOICE)
  // =========================
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();

    speech.voice =
      voices.find(v => v.name.includes("Google UK English Female")) ||
      voices.find(v => v.name.toLowerCase().includes("female")) ||
      voices[0];

    speech.rate = 0.9;
    speech.pitch = 1.3;

    setStatus("speaking");

    const canvas = document.querySelector("canvas");

    // 👄 fake talking animation (safe)
    let talking = setInterval(() => {
      if (!canvas) return;
      canvas.style.filter = "brightness(1.1)";
      setTimeout(() => {
        canvas.style.filter = "brightness(1)";
      }, 80);
    }, 120);

    speech.onend = () => {
      clearInterval(talking);
      setStatus("idle");
    };

    window.speechSynthesis.speak(speech);
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>

      {/* 🎭 LIVE2D AVATAR */}
      <Live2DAvatar />

      {/* 🎤 BUTTON */}
      <button
        onClick={startListening}
        style={{
          position: "fixed",
          bottom: 100,
          right: 20,
          padding: "12px 16px",
          background: "#6366f1",
          color: "white",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer"
        }}
      >
        🎤 Start
      </button>

      {/* STATUS */}
      <div
        style={{
          position: "fixed",
          bottom: 30,
          width: "100%",
          textAlign: "center",
          color: "white",
          fontSize: "18px"
        }}
      >
        {status === "idle" && "Click mic 💛"}
        {status === "listening" && "🎤 Listening..."}
        {status === "thinking" && "🤔 Thinking..."}
        {status === "speaking" && "💛 Mikasa speaking..."}
      </div>

    </div>
  );
}

export default App;