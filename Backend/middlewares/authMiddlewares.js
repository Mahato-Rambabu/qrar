import jwt from "jsonwebtoken";
import Restaurant from "../models/restaurant.js";

const authMiddleware = async (req, res, next) => {
  // Retrieve the token from cookies
  const token = req.cookies?.authToken; // Ensure cookies middleware is set up in your app

  if (!token) {
    return res.status(401).json({ error: "Authentication token missing" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the restaurant in the database using the token payload
    const restaurant = await Restaurant.findById(decoded.id); // Adjust key if necessary
    if (!restaurant) {
      return res.status(404).json({ error: "Invalid restaurant ID" });
    }

    // Attach the restaurant's information to the request object
    req.user = { id: restaurant._id, name: restaurant.name, restaurantId: restaurant._id };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ error: "Invalid token or authentication failed" });
  }
};

export default authMiddleware;
