import { supabase } from "./config/supabaseClient.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid authorization header." });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.error("Supabase auth error:", error.message);
      return res.status(401).json({ error: "Invalid token." });
    }

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    // Lampirkan data user ke request untuk penggunaan selanjutnya
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication failed." });
  }
};
