import { serialize } from "cookie";
import { v4 as uuidv4 } from "uuid"; // To generate a unique session ID
import cron from "node-cron"; // Import cron library
import axios from "axios"; // For making HTTP requests

const SESSION_EXPIRATION_TIME = parseInt(process.env.SESSION_EXPIRATION_TIME, 10); 

let sessions = {}; // In-memory storage for active sessions (for demonstration)

// Function to delete the corpus associated with a session
async function deleteCorpus(corpusKey) {
  try {
    console.log(`[session.js]: Deleting corpus with key: ${corpusKey}`);
    
    // Make an API request to delete the corpus
    const response = await axios.delete(`https://api.vectara.io/v2/corpora/${corpusKey}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VECTARA_PERSONAL_API_KEY, // Make sure to set this in your environment variables
      },
    });

    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`[session.js]: Failed to delete corpus: ${response.statusText}`);
    }
    
    console.log(`[session.js]: Corpus ${corpusKey} deleted successfully`);
  } catch (error) {
    console.error(`[session.js]: Error deleting corpus: ${error.message}`);
  }
}

// Periodic task to clean up expired sessions
cron.schedule("* * * * *", () => { // Runs every minute
  const currentTime = Date.now();
  
  // Check for expired sessions
  Object.keys(sessions).forEach(sessionId => {
    const session = sessions[sessionId];
    
    if (currentTime - session.lastActive > SESSION_EXPIRATION_TIME * 1000) { // 24 hours expiration
      // Session has expired, delete the corpus and session
      deleteCorpus(session.sessionId); // Pass corpus key to delete
      delete sessions[session.sessionId]; // Remove session from active sessions
    }
  });
});

export default function handler(req, res) {
  const existingSession = req.cookies.session_id;

  if (!existingSession || !sessions[existingSession]) {
    // No session ID found or session ID does not exist in sessions, create a new session
    const newSessionId = uuidv4(); // Generate a unique session ID

    // Create a new session 
    const cookie = serialize("session_id", newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: SESSION_EXPIRATION_TIME, // Session expires in a day
      path: "/",
    });
    
    // Store the session with the corpus key and timestamp
    sessions[newSessionId] = {
      sessionId: newSessionId, 
      lastActive: Date.now(),
    };

    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "New session created", sessionId: newSessionId });
  } else {
    // Update last activity timestamp for the existing session
    sessions[existingSession].lastActive = Date.now();
    res.status(200).json({ message: "Existing session found", sessionId: existingSession });
  }
}