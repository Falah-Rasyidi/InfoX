import { serialize } from "cookie";
import { v4 as uuidv4 } from "uuid"; // To generate a unique session ID
import cron from "node-cron"; // Import cron library
import axios from "axios"; // For making HTTP requests

let sessions = {}; // In-memory storage for active sessions (for demonstration)

// Function to delete the corpus associated with a session
async function deleteCorpus(corpusKey) {
  try {
    console.log(`Deleting corpus with key: ${corpusKey}`);
    
    // Make an API request to delete the corpus
    const response = await axios.delete(`https://api.vectara.io/v2/corpora/${corpusKey}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VECTARA_PERSONAL_API_KEY, // Make sure to set this in your environment variables
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to delete corpus: ${response.statusText}`);
    }
    
    console.log(`Corpus ${corpusKey} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting corpus: ${error.message}`);
  }
}

// Periodic task to clean up expired sessions
cron.schedule("* * * * *", () => { // Runs every minute
  const currentTime = Date.now();
  
  // Check for expired sessions
  Object.keys(sessions).forEach(sessionId => {
    const session = sessions[sessionId];
    
    if (currentTime - session.lastActive > 60 * 60 * 24 * 1000) { // 24 hours expiration
      // Session has expired, delete the corpus and session
      deleteCorpus(session.sessionId); // Pass corpus key to delete
      delete sessions[session.sessionId]; // Remove session from active sessions
      console.log(`Session ${session.sessionId} expired and deleted.`);
    }
  });
});

export default function handler(req, res) {
  const existingSession = req.cookies.session_id;

  if (!existingSession) {
    // No session ID found, create a new session
    const newSessionId = uuidv4(); // Generate a unique session ID

    // Create a new session 
    const cookie = serialize("session_id", newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 60 * 60 * 24, // Session expires in a day
      path: "/",
    });
    
    // Store the session with the corpus key and timestamp
    sessions[newSessionId] = {
      sessionId: newSessionId, 
      lastActive: Date.now(),
    };

    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "New session created", sessionId: newSessionId});
  } else {
    // Update last activity timestamp for the existing session
    sessions[existingSession].lastActive = Date.now();
    res.status(200).json({ message: "Existing session found", sessionId: existingSession });
  }
}