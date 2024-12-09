"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false); // Track popup visibility
  const chatHistoryRef = useRef(null); // Reference for scrolling

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
      const res = await fetch("/api/chat", {
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
      console.error("Error during /api/chat fetch:", error);
    }
    // Call Vectara API to generate post
    //   try {
    //     const res = await fetch("/api/generate", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ prompt: input }),
    //     });
    //     const data = await res.json();

    //     setMessages([
    //       { text: input, isBot: false, seen: false },
    //       { text: data.message.message, isBot: true, seen: false },
    //       ...messages,
    //     ]);
    //     setInput("");
    //   } catch (error) {
    //     console.error("Error during /api/generate fetch:", error);
    // };
  };

  const handleExit = async () => {
    try {
      // Make a request to the /api/exit endpoint to clear the session
      const response = await fetch("/api/exit", {
        method: "GET",
        credentials: "same-origin", // Include cookies with the request
      });
  
      // Parse the JSON response
      const data = await response.json();
  
      if (response.ok) {
        // Handle success (session cleared)
        console.log(data.message); // "Session cleared"
        // Optionally, update UI state or redirect
      } else {
        // Handle error if needed
        console.error("Error clearing session:", data.message);
      }
    } catch (error) {
      console.error("Error during exit:", error);
    }
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
    <div>
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen text-center px-4">
        <div>
          <h1 className="text-5xl font-extrabold mb-6 text-white">
            Welcome to{" "}
            <span className="text-blue-400">
              Info<sup>X</sup>
            </span>
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Your gateway to AI-powered posts. Type in your topics and let the
            magic happen.
          </p>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-600"
            onClick={handleExit}
          >
            Remove session
          </button>
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
                className="bg-blue-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-600"
              >
                Send
              </button>
            </div>

            <div className="flex gap-4 justify-center">
              <select
                id="platform"
                className="bg-blue-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-500"
              >
                <option selected disabled>
                  Platform
                </option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>Reddit</option>
                <option>Twitter</option>
              </select>

              <select
                id="format"
                className="bg-blue-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-500"
              >
                <option selected disabled>
                  Format
                </option>
                <option>Post</option>
                <option>Image</option>
                <option>Video</option>
                <option>Meme</option>
              </select>

              <select
                id="tone"
                className="bg-blue-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-500"
              >
                <option selected disabled>
                  Tone
                </option>
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

      {/* Chat Section */}
      <div
        ref={chatHistoryRef}
        className="container mx-auto my-8 px-4 py-6 bg-gradient-to-br from-gray-700 via-slate-800 to-gray-900 rounded-xl shadow-2xl backdrop-blur-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Chat History</h2>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              id={`message-${idx}`}
              key={idx}
              className={`p-4 rounded-lg message ${
                msg.isBot
                  ? "bg-gray-800 text-white text-left"
                  : "bg-blue-500 text-white text-right"
              } ${msg.seen ? "message-seen" : "message-unseen"}`} // Highlight unseen messages
            >
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
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
