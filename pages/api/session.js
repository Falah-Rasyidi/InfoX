import { serialize } from "cookie";
import { v4 as uuidv4 } from "uuid"; // To generate a unique session ID
import cron from "node-cron"; // Import cron library

let sessions = {}; // In-memory storage for active sessions (for demonstration)

// Function to delete the corpus associated with a session
function deleteCorpus(sessionId) {
  console.log(`Deleting corpus for session: ${sessionId}`);
  // Implement your logic here to delete the corpus from the server (e.g., API call or file deletion)
}

// Periodic task to clean up expired sessions
cron.schedule("* * * * *", () => { // Runs every minute
  const currentTime = Date.now();
  
  // Check for expired sessions
  Object.keys(sessions).forEach(sessionId => {
    const session = sessions[sessionId];
    
    if (currentTime - session.lastActive > 60 * 60 * 24 * 1000) { // 24 hours expiration
      // Session has expired, delete the corpus and session
      deleteCorpus(sessionId);
      delete sessions[sessionId]; // Remove session from active sessions
      console.log(`Session ${sessionId} expired and deleted.`);
    }
  });
});

export default function handler(req, res) {
  const existingSession = req.cookies.session_id;

  if (!existingSession) {
    // No session ID found, create a new session
    const newSessionId = uuidv4(); // Generate a unique session ID
    const cookie = serialize("session_id", newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 60 * 60 * 24, // Session expires in a day
      path: "/",
    });
    
    // Store the session along with the timestamp
    sessions[newSessionId] = { lastActive: Date.now() };

    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "New session created", sessionId: newSessionId });
  } else {
    // Update last activity timestamp for the existing session
    sessions[existingSession].lastActive = Date.now();
    res.status(200).json({ message: "Existing session found", sessionId: existingSession });
  }
}
