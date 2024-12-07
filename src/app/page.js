'use client';

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send the input to the API endpoint
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setMessages([...messages, { text: input, isBot: false }, { text: data.message, isBot: true }]);
    setInput('');
  };

  return (
    <div>
      <h1>AI Chat Bot</h1>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.isBot ? 'left' : 'right' }}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
