import { useState } from "react";
import axios from "axios";

function App() {
  const [status, setStatus] = useState("idle");
  const [subtitle, setSubtitle] = useState(""); // ✅ NEW

  // 🎤 START LISTENING
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported 😢");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log("🎤 Mic started");
      setStatus("listening");
    };

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      console.log("YOU:", text);

      setStatus("thinking");

      try {
        const res = await axios.post("http://localhost:5000/api/chat", {
          message: text,
        });

        const reply = res.data.reply;
        speak(reply);
      } catch (err) {
        console.error(err);
        setStatus("idle");
      }
    };

    recognition.onerror = (e) => {
      console.log("MIC ERROR:", e.error);
      setStatus("idle");
    };

    recognition.onend = () => {
      console.log("🎤 Mic ended");
    };

    recognition.start();
  };

  // 🔊 SPEAK FUNCTION
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);

    // 🎭 Emotion-based voice
    if (text.includes("sad")) {
      speech.rate = 0.75;
      speech.pitch = 0.9;
    } else if (text.includes("love") || text.includes("happy")) {
      speech.rate = 1;
      speech.pitch = 1.3;
    } else {
      speech.rate = 0.9;
      speech.pitch = 1.1;
    }

    speech.lang = "en-US";

    setStatus("speaking");
    setSubtitle(text); // ✅ SHOW SUBTITLE

    speech.onend = () => {
      setStatus("idle");
      setSubtitle(""); // ✅ CLEAR SUBTITLE

      setTimeout(() => {
        startListening();
      }, 500);
    };

    window.speechSynthesis.speak(speech);
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      
      {/* 🎥 BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: status === "speaking" ? "105%" : "100%", // ✅ ANIMATION
          height: "100%",
          objectFit: "cover",
          transform: status === "speaking" ? "scale(1.05)" : "scale(1)",
          transition: "all 0.3s ease",
          zIndex: 0,
        }}
      >
        <source src="/avatar/avatar.mp4" type="video/mp4" />
      </video>

      {/* 🎤 STATUS TEXT */}
      <div
        style={{
          position: "fixed",
          bottom: 30,
          width: "100%",
          textAlign: "center",
          color: "white",
          fontSize: "18px",
          zIndex: 10,
          textShadow: "0px 0px 10px rgba(0,0,0,0.8)"
        }}
      >
        {status === "idle" && "Click mic to start 💛"}
        {status === "listening" && "🎤 Listening..."}
        {status === "thinking" && "🤔 Thinking..."}
        {status === "speaking" && "💛 Mikasa speaking..."}
      </div>

      {/* 💬 SUBTITLE */}
      {subtitle && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            width: "100%",
            textAlign: "center",
            color: "white",
            fontSize: "16px",
            zIndex: 10,
            padding: "0 20px",
            textShadow: "0px 0px 10px rgba(0,0,0,0.8)"
          }}
        >
          {subtitle}
        </div>
      )}

      {/* 🎤 START BUTTON */}
      <button
        onClick={startListening}
        style={{
          position: "fixed",
          bottom: 120,
          right: 20,
          zIndex: 20,
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
    </div>
  );
}

export default App;