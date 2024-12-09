import { serialize } from "cookie";
import { v4 as uuidv4 } from "uuid"; // To generate a unique session ID

export default function handler(req, res) {
  // Check if there's an existing session
  const existingSession = req.cookies.session_id;

  if (!existingSession) {
    // No session ID found, create a new session
    const newSessionId = uuidv4(); // Generate a unique session ID
    const cookie = serialize("session_id", newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 60 * 60 * 24 * 7, // Session expires in 7 days
      path: "/",
    });
    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "New session created", sessionId: newSessionId });
  } else {
    res.status(200).json({ message: "Existing session found", sessionId: existingSession });
  }
}
