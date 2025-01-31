const authMiddleware = async (req, res, next) => {
  try {
    // Check if session exists
    if (!req.session.restaurant) {
      return res.status(401).json({ error: "Unauthorized: No active session" });
    }

    // Attach user info to request object
    req.user = req.session.restaurant;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default authMiddleware;
