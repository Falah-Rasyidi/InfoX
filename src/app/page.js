"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [articles, setArticles] = useState([]);
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

  // Mark messages as seen when they fit in the user's viewport
  const handleScroll = () => {
    const chatHistory = chatHistoryRef.current;
    if (chatHistory) {
      messages.map((msg, idx) => {
        if (idx % 2 === 0 && idx + 1 < messages.length) {
          console.log(messages);
          const message1 = document.getElementById(`message-${idx}`);
          const message2 = document.getElementById(`message-${idx + 1}`);
          if (message1 && message2) {
            const rect2 = message2.getBoundingClientRect();
            if (rect2.bottom <= window.innerHeight) {
              // 3.5-second delay
              setTimeout(() => {
                messages[idx] = { ...msg, seen: true };
                messages[idx + 1] = { ...messages[idx + 1], seen: true };
                setMessages([...messages]);
                const unseenExists = messages.some((msg) => !msg.seen);
                setPopupVisible(unseenExists);
              }, 3500);
            }
          }
        }
      });
    }
  };

  // Fetch session data on initial render
  useEffect(() => {
    const fetchAndCreateCorpus = async () => {
      try {
        // Fetch the session ID
        const fetchSession = async () => {
          const response = await fetch("/api/session", {
            method: "GET",
            credentials: "same-origin", // Include cookies with the request
          });
  
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch session");
          }
  
          const data = await response.json();
          console.log("Session data:", data);
          return data.sessionId; // Return the session ID
        };
  
        // Create a corpus
        const createCorpus = async (sessionId) => {
          const response = await fetch("/api/corpus", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              corpusKey: sessionId, // Use sessionId as the corpusKey
              description: `Corpus created for client ${sessionId}'s session.`,
            }),
          });
  
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create corpus");
          }
  
          const data = await response.json();
          console.log("Corpus creation response:", data);
        };
  
        // Execute the steps in sequence
        const sessionId = await fetchSession(); // Fetch the session ID
        await createCorpus(sessionId); // Use the session ID to create the corpus
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
    fetchAndCreateCorpus(); // Trigger the combined function
  }, []);
  

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
    // TODO: Remove Chat API call
    if (!input.trim()) return;
    try {
      const res = await fetch("/api/retrieve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();

      setInput("");
    } catch (error) {
      console.error("Error during /api/retrieve fetch:", error);
    }
    // Call Vectara API to generate post
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: input }),
        });
        const data = await res.json();

        setMessages([
          { text: input, isBot: false, seen: false },
          { text: data.message.message, isBot: true, seen: false },
          ...messages,
        ]);
        setInput("");
      } catch (error) {
        console.error("Error during /api/generate fetch:", error);
    };
  };

  // Scroll to the chat history section
  const scrollToChatHistory = () => {
    chatHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
    setPopupVisible(false); // Hide popup
    setTimeout(() => {
      const updatedMessages = messages.map((msg) => ({ ...msg, seen: true }));
      setMessages(updatedMessages); // Mark all messages as seen
    }, 2000);
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
            Welcome to <span className="text-customGreen text-400">Info<sup>X</sup></span>
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
                defaultValue="Platform"
              >
                <option value="Platform" disabled>Platform</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Reddit">Reddit</option>
                <option value="Twitter">Twitter</option>
              </select>

              <select
                id="format"
                className="bg-customOrange bg-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-customGreen bg-500"
                value={format}
                onChange={handleFormatChange}
                defaultValue="Format"
              >
              <option value="Format" disabled>Format</option>
                <option value="Post">Post</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Meme">Meme</option>
              </select>

              <select
                id="tone"
                className="bg-customOrange bg-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-customGreen bg-500"
                value={tone}
                onChange={handleToneChange}
                defaultValue="Tone"
              >
                <option value="Tone" disabled>Tone</option>
                <option value="Formal">Formal</option>
                <option value="Casual">Casual</option>
                <option value="Inspirational">Inspirational</option>
                <option value="Humorous">Humorous</option>
                <option value="Authoratative">Authoratative</option>
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
            className="px-4 py-2 bg-customOrange bg-500 text-white rounded-lg font-semibold hover:bg-customGreen"
          >
            {isNewsMode ? "Switch to Chat History" : "Switch to News Articles"}
          </button>
        </div>

        {/* Content */}
        {isNewsMode ? (
          <div className="p-4 flex gap-4 justify-center flex-wrap bg-white">
            {messages.map((msg, idx) => (
              // <div
              //   key={idx}
              //   className="p-4 bg-customWhite bg-200 rounded-lg shadow-md flex flex-col gap-2"
              // >
              //   <div className="text-orange-900 font-semibold">
              //     News Topic: <span className="italic">{}</span>
              //   </div>
              //   <p className="text-sm">
              //     {topic}
              //   </p>
              // </div>
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
