"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false); // Track popup visibility
  const chatHistoryRef = useRef(null); // Reference for scrolling
  const [topics, setTopics] = useState([
    "Trending topic 1!",
    "Trending topic 2!",
    "Trending topic 3!",
  ]); // State about trending news topics
  const [platform, setPlatform] = useState("");
  const [format, setFormat] = useState("");
  const [tone, setTone] = useState("");

  // Toggle button state for switching between chat and news mode
  const [isNewsMode, setIsNewsMode] = useState(false);
  const toggleMode = () => {
    setIsNewsMode((prevMode) => !prevMode);
  };

  const handlePlatformChange = (e) => setPlatform(e.target.value);
  const handleFormatChange = (e) => setFormat(e.target.value);
  const handleToneChange = (e) => setTone(e.target.value);

  // Mark all messages as seen when scrolled to the bottom
  const handleScroll = () => {
    const chatHistory = chatHistoryRef.current;
    if (
      chatHistory &&
      chatHistory.getBoundingClientRect().bottom <= window.innerHeight
    ) {
      const updatedMessages = messages.map((msg) => ({ ...msg, seen: true }));
      setMessages(updatedMessages);
      setPopupVisible(false); // Hide popup
    }
  };

  // Highlight unseen messages on initial render and scrolling
  useEffect(() => {
    const unseenExists = messages.some((msg) => !msg.seen);
    setPopupVisible(unseenExists);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [messages]);

  // Handle form submission
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

      messages.unshift({ text: data.message.message, isBot: true, seen: false });
      messages.unshift({ text: input, isBot: false, seen: false });
      setMessages(messages);
      setInput("");
    } catch (error) {
      console.error("Error during /api/chat fetch:", error);
    }
  };

  // Scroll to the chat history section
  const scrollToChatHistory = () => {
    chatHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
    const updatedMessages = messages.map((msg) => ({ ...msg, seen: true }));
    setMessages(updatedMessages); // Mark all messages as seen
    setPopupVisible(false); // Hide popup
  };

  return (
    <div className="bg-custom-gradient h-screen">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen text-center px-4">
        <div>
          <Image
            src="/image.png"
            alt="Mascot"
            width={300}
            height={300}
            className="my-auto mx-auto w-1/2"
          />
          <h1 className="text-5xl font-extrabold mb-6 text-white">
            Welcome to <span className="text-black text-400">Info<sup>X</sup></span>
          </h1>
          <p className="text-lg text-white-300 mb-8">
            Your gateway to AI-powered posts. Type in your topics and let the magic happen.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center gap-4"
          >
            <div className="flex w-full gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a topic you'd like to know about..."
                className="w-full p-4 text-black rounded-lg"
              />
              <button
                type="submit"
                className="bg-customOrange bg-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-customGreen bg-600"
              >
                Send
              </button>
            </div>

            <div className="flex gap-4 justify-center">
              <select
                id="platform"
                className="bg-customOrange bg-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-customGreen bg-500"
                value={platform}
                onChange={handlePlatformChange}
              >
                <option selected disabled>Platform</option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>Reddit</option>
                <option>Twitter</option>
              </select>

              <select
                id="format"
                className="bg-customOrange bg-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-customGreen bg-500"
                value={format}
                onChange={handleFormatChange}
              >
                <option selected disabled>Format</option>
                <option>Post</option>
                <option>Image</option>
                <option>Video</option>
                <option>Meme</option>
              </select>

              <select
                id="tone"
                className="bg-customOrange bg-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-customGreen bg-500"
                value={tone}
                onChange={handleToneChange}
              >
                <option selected disabled>Tone</option>
                <option>Formal</option>
                <option>Casual</option>
                <option>Inspirational</option>
                <option>Humorous</option>
                <option>Authoratative</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Chat Section with Toggle */}
      <div className="container mx-auto my-20 px-4 py-6 bg-gradient-to-br from-gray-700 via-slate-800 to-gray-900 rounded-xl shadow-2xl backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            {isNewsMode ? "News Articles" : "Chat History"}
          </h2>
          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
          >
            {isNewsMode ? "Switch to Chat History" : "Switch to News Articles"}
          </button>
        </div>

        {/* Content */}
        {isNewsMode ? (
          <div className="grid gap-4">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="p-4 bg-customOrange bg-200 rounded-lg shadow-md flex flex-col gap-2"
              >
                <div className="text-orange-900 font-semibold">
                  News Topic: <span className="italic">{topic}</span>
                </div>
                <p className="text-sm">
                  {topic}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div ref={chatHistoryRef} className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  msg.isBot
                    ? "bg-gray-800 text-white text-left"
                    : "bg-blue-500 text-white text-right"
                } ${msg.seen ? "" : "border-4 border-yellow-400"}`} // Highlight unseen messages
              >
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animated Arrow */}
      {popupVisible && (
        <div
          onClick={scrollToChatHistory}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-full p-4 cursor-pointer hover:bg-blue-600 animate-bounce shadow-2xl shadow-black"
          title="View Chat History"
        >
          ↓
        </div>
      )}
    </div>
  );
}
