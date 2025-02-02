import jwt from "jsonwebtoken";
import Restaurant from "../models/restaurant.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const restaurant = await Restaurant.findById(decoded.id); // Adjust key if necessary
    if (!restaurant) {
      return res.status(404).json({ error: "Invalid restaurant ID" });
    }

    req.user = { id: restaurant._id, name: restaurant.name, restaurantId: restaurant._id };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Invalid token or authentication failed" });
  }
};

export default authMiddleware;