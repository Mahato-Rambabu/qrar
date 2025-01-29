import express from "express";
import User from "../models/user.js";
import authMiddleware from '../middlewares/authMiddlewares.js';
import mongoose from 'mongoose';

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/total-users",authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const totalUsers = await User.countDocuments({restaurantId}); // Count all user documents
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ message: "Error fetching total users" });
  }
});

router.get('/users-by-age-group', authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id; // Extracted from the token via authMiddleware

    if (!restaurantId || !isValidObjectId(restaurantId)) {
      return res.status(400).json({ error: 'Invalid restaurant ID.' });
    }

    const ageGroups = await User.aggregate([
      {
        $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $lte: ['$age', 27] },
              'Gen Z',
              {
                $cond: [
                  { $and: [{ $gte: ['$age', 28] }, { $lte: ['$age', 42] }] },
                  'Millennials',
                  'Gen X',
                ],
              },
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedResponse = ageGroups.reduce((acc, group) => {
      acc[group._id] = group.count;
      return acc;
    }, {});

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error('Error categorizing users by age groups:', error);
    res.status(500).json({ error: 'Error categorizing users by age groups.' });
  }
});

// Save user details
router.post("/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;
  const { name, phone, age } = req.body;

  if (!name || !phone || !age) {
      return res.status(400).json({ error: "All fields are required" });
  }

  try {
      const existingUser = await User.findOne({ phone, restaurantId });
      if (existingUser) {
          return res.status(400).json({ error: "Phone number already registered for this restaurant" });
      }

      const newUser = new User({ name, phone, age, restaurantId });
      await newUser.save();

      // Set a cookie with customerIdentifier
      res.cookie("customerIdentifier", newUser._id.toString(), {
          httpOnly: true,
          secure: true , // Change to true for production with HTTPS
          sameSite: "None", // Adjust based on your frontend-backend origin setup
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
      console.error("Error saving user details:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Get user details for a specific restaurant
router.get("/", authMiddleware, async (req, res) => {
  const { restaurantId } = req.user;

  if (!restaurantId) {
    return res.status(400).json({ error: "Invalid restaurant ID" });
  }

  try {
    const users = await User.find({ restaurantId }).select("name phone age createdAt");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

export default router;
