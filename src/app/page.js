"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionCookie, setSessionCookie] = useState(null);
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
        setSessionCookie(sessionId); // Store the session ID in state
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
    if (!input.trim()) return;
    let data = null;

    try {
      const res = await fetch("/api/retrieve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      data = await res.json();
    } catch (error) {
      console.log("Complication during /api/retrieve fetch:", error);
    }

    // Upload news articles to current session
    if (data) {
      data.message.message.forEach(async (article) => {
        // Define the document data based on the article
        const documentData = {
          id: article.url, // Assuming each article has an id property
          type: "core", // Assuming a fixed type for the document
          document_parts: [
            {
              text: article.text, // Assuming each article has a text property
              context: article.title, // Assuming each article has a context property
            },
          ],
        };
    
        // Make a POST request to the upload.js handler
        try {
          const uploadRes = await fetch(`/api/upload?corpus_key=${sessionCookie}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(documentData),
          });
    
          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            console.error("Error uploading document:", errorData.message);
          } else {
            const uploadData = await uploadRes.json();
            console.log("Document uploaded successfully:", uploadData);
          }
        } catch (uploadError) {
          console.error("Error during document upload:", uploadError);
        }
      });
    }

    // TODO: Call Vectara API to generate post

    // Reset input field
    setInput("");
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
              <select id="platform" className="bg-blue-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-500" defaultValue="Platform">
                <option value="Platform" disabled>Platform</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Reddit">Reddit</option>
                <option value="Twitter">Twitter</option>
              </select>

              <select id="format" className="bg-blue-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-500" defaultValue="Format">
                <option value="Format" disabled>Format</option>
                <option value="Post">Post</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Meme">Meme</option>
              </select>

              <select id="tone" className="bg-blue-400 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-500" defaultValue="Tone">
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
