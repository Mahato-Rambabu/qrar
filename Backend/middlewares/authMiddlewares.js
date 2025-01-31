const authMiddleware = async (req, res, next) => {
  try {
    // Fix property name from _id to id
    if (!req.session.restaurant?.id) {
      return res.status(401).json({ error: "Unauthorized: No active session" });
    }

    req.user = req.session.restaurant.id;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default authMiddleware;