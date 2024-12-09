import { serialize } from "cookie";

export default function handler(req, res) {
  const cookie = serialize("session_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    maxAge: -1, // This makes the cookie expire immediately
    path: "/",
  });
  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ message: "Session cleared" });
}
