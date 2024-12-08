"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatHistoryRef = useRef(null); // Reference for scrolling

  // Clear messages on refresh
  useEffect(() => {
    setMessages([]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Avoid empty messages
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setMessages([
        ...messages,
        { text: input, isBot: false },
        { text: data.message.message, isBot: true },
      ]);
      setInput("");
    } catch (error) {
      console.error("Error during /api/chat fetch:", error);
    }
  };

  const scrollToChatHistory = () => {
    chatHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen text-center px-4">
        <div>
          <h1 className="text-5xl font-extrabold mb-6 text-white">
            Welcome to <span className="text-blue-400">InfoX</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Your gateway to AI-powered conversations. Type in your thoughts and
            let the magic happen.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex justify-center items-center gap-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question here..."
              className="w-1/2 p-4 text-black rounded-lg"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-600"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Chat Section */}
      <div
        ref={chatHistoryRef}
        className="container mx-auto px-4 py-8 bg-gray-100"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Chat History</h2>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${
                msg.isBot
                  ? "bg-gray-800 text-white text-left"
                  : "bg-blue-500 text-white text-right"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Arrow */}
      {messages.length > 0 && (
        <div
          onClick={scrollToChatHistory}
          className="fixed bottom-10 right-10 bg-blue-500 text-white rounded-full p-4 cursor-pointer hover:bg-blue-600 animate-bounce shadow-lg"
          title="View Chat History"
        >
          ↓
        </div>
      )}
    </div>
  );
}
