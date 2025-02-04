import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import authMiddleware from "../middlewares/authMiddlewares.js";
import validateCustomer from "../middlewares/validateCustomer.js";
import moment from "moment";

const router = express.Router();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


// Helper function to calculate date ranges
const getDateRange = (dateRange) => {
  const now = moment();
  switch (dateRange) {
    case "24h":
      return now.subtract(24, "hours").toDate(); // Last 24 hours
    case "week":
      return now.subtract(1, "week").toDate(); // Last week
    case "month":
      return now.startOf("month").toDate(); // Start of current month
    case "year":
      return now.startOf("year").toDate(); // Start of current year
    default:
      return null;
  }
};

// Endpoint to get total profit and order count based on date range
router.get("/total-profit", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { dateRange } = req.query; // Accept the date range query parameter
    const startDate = getDateRange(dateRange);

    if (!startDate) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Aggregation pipeline to get profit and order count
    const aggregationPipeline = [
      {
        $match: {
          restaurantId,
          status: "Served", // Only consider completed orders
          createdAt: { $gte: startDate }, // Filter orders by the start date
        },
      },
      {
        $project: {
          total: 1, // Include the total of the order
          createdAt: 1, // Include the created date of the order
        },
      },
    ];

    // Date grouping logic for different ranges (24h, week, month, year)
    if (dateRange === "24h") {
      aggregationPipeline.push({
        $group: {
          _id: null, // Single group for the entire 24 hours
          totalProfit: { $sum: "$total" }, // Sum the order totals for the last 24 hours
        },
      });
    } else if (dateRange === "week" || dateRange === "month") {
      aggregationPipeline.push({
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
          totalProfit: { $sum: "$total" }, // Sum the order totals for each day
        },
      });

      aggregationPipeline.push({
        $group: {
          _id: null, // Single group for the entire week/month
          totalProfit: { $sum: "$totalProfit" }, // Total profit for the week/month
          dailyData: {
            $push: {
              day: "$_id", // Push each day's data into an array
              totalProfit: "$totalProfit",
            },
          },
        },
      });
    } else if (dateRange === "year") {
      aggregationPipeline.push({
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          totalProfit: { $sum: "$total" }, // Sum the order totals for each month
        },
      });

      aggregationPipeline.push({
        $group: {
          _id: null, // Single group for the entire year
          totalProfit: { $sum: "$totalProfit" }, // Total profit for the year
          monthlyData: {
            $push: {
              month: "$_id", // Push each month's data into an array
              totalProfit: "$totalProfit",
            },
          },
        },
      });
    }

    // Sorting the results based on the date or other criteria
    aggregationPipeline.push({
      $sort: { "dailyData.day": 1, "monthlyData.month": 1 }, // Sort by day or month (ascending)
    });

    // Execute the aggregation query
    const profitData = await Order.aggregate(aggregationPipeline);

    // Format the response
    const response = {
      totalProfit: profitData[0]?.totalProfit || 0,
      dailyData: profitData[0]?.dailyData || [],
      monthlyData: profitData[0]?.monthlyData || [],
    };

    // Send the response
    res.json({ data: response });
  } catch (error) {
    res.status(500).json({ message: "Error calculating total profit" });
  }
});


// Route to get list of products sold, sorted from high to low
router.get("/product-sales", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { dateRange } = req.query; // Accept the date range query parameter
    const startDate = getDateRange(dateRange);

    if (!startDate) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Aggregate the product sales data
    const productSales = await Order.aggregate([
      {
        $match: {
          restaurantId,
          status: "Served", // Only consider completed orders
          createdAt: { $gte: startDate }, // Filter orders by the start date
        },
      },
      {
        $unwind: "$items", // Unwind the items array so each product is a separate document
      },
      {
        $group: {
          _id: "$items.productId", // Group by product ID
          totalQuantity: { $sum: "$items.quantity" }, // Sum the quantity for each product
        },
      },
      {
        $sort: { totalQuantity: -1 }, // Sort by the total quantity in descending order
      },
      {
        $lookup: {
          from: "products", // Lookup the products collection to get product details
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails", // Unwind the product details to get them as individual fields
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productDetails.name", // Assuming your products have a "name" field
          totalQuantity: 1, // Include the total quantity sold
          price: "$productDetails.price", // Include the price (if required)
        },
      },
    ]);

    // Send back the sorted list of products
    res.json(productSales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching product sales data" });
  }
});

router.get("/order-count", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { dateRange } = req.query;
    const startDate = getDateRange(dateRange);

    if (!startDate) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const orderCount = await Order.aggregate([
      {
        $match: {
          restaurantId,
          status: "Served",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      dateRange,
      orderCount: orderCount[0]?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching order count:", error);
    res.status(500).json({ message: "Error fetching order count" });
  }
});

// Order history endpoint
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { dateRange } = req.query;

    if (!restaurantId || !isValidObjectId(restaurantId)) {
      console.error("Invalid restaurant ID");
      return res.status(400).json([]); // Return an empty array on error
    }

    const startDate = getDateRange(dateRange);
    if (!startDate) {
      console.error("Invalid date range");
      return res.status(400).json([]); // Return an empty array on error
    }

    const servedOrders = await Order.find({
      restaurantId,
      status: "Served",
      updatedAt: { $gte: startDate },
    })
      .populate("customerIdentifier", "name")
      .populate("items.productId", "name description img")
      .select("orderNo total items status updatedAt customerIdentifier")
      .sort({ updatedAt: -1 });

    // Transform orders to include customerName with a default value
    const transformedOrders = servedOrders.map((order) => ({
      ...order.toObject(),
      customerName: order.customerIdentifier?.name || "N/A",
    }));

    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json([]); // Always return an array
  }
});

//routes for pending orders
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.user.id;
    const { dateRange } = req.query; // Extract the dateRange query parameter

    if (!isValidObjectId(restaurantId)) {
      return res.status(400).json({ error: "Invalid restaurant ID." });
    }

    const startDate = getDateRange(dateRange); // Use the getDateRange helper
    if (!startDate) {
      console.error("Invalid date range");
      return res.status(400).json({ error: "Invalid date range." });
    }

    // Fetch pending orders within the date range
    const pendingOrders = await Order.find({
      restaurantId,
      status: "Pending",
      createdAt: { $gte: startDate }, // Filter by startDate
    })
      .populate("customerIdentifier", "name")
      .populate("items.productId", "name description img")
      .select("orderNo total items status createdAt customerIdentifier")
      .sort({ createdAt: -1 });

    const transformedOrders = pendingOrders.map((order) => ({
      ...order.toObject(),
      customerName: order.customerIdentifier?.name || "Unknown",
    }));

    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error("Error fetching pending orders:", error.message);
    res.status(500).json({ error: "Failed to fetch pending orders. Please try again later." });
  }
});

// Pass io to your route file if needed
const configureOrderRoutes = (io) => {
  // POST route: Place a new order
  router.post("/:restaurantId", async (req, res) => {
    const { restaurantId } = req.params;
    const { items, total, customerIdentifier } = req.body;

    // Validate customerIdentifier
    if (!customerIdentifier || !mongoose.Types.ObjectId.isValid(customerIdentifier)) {
      return res.status(400).json({ error: "Valid customer identifier is required." });
    }

    // Validate items and total (existing code)
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required and must be a non-empty array." });
    }

    if (!total || typeof total !== "number") {
      return res.status(400).json({ error: "Total price is required and must be a number." });
    }

    try {
      // Get the start of the day (00:00:00) to calculate today's orders
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Count today's orders for the restaurant (based on createdAt date)
      const orderCount = await Order.countDocuments({
        createdAt: { $gte: startOfDay }, // Orders created after midnight today
        restaurantId, // Filter by restaurantId
      });

      // Create a new order
      const newOrder = new Order({
        restaurantId,
        items,
        total,
        status: "Pending",
        orderNo: orderCount + 1, // Start from 1 each day
        customerIdentifier,
        createdAt: new Date(),
      });

      // Save the new order to the database
      const savedOrder = await newOrder.save();

      // Populate the customer name and product data for each item
      await savedOrder.populate("customerIdentifier", "name"); // Populate customer name
      await savedOrder.populate("items.productId"); // Populate product data for each item

      // Prepare the populated order
      const populatedOrder = {
        ...savedOrder.toObject(),
        customerName: savedOrder.customerIdentifier.name || "Guest", // Set customer name or "Guest"
      };

      // Emit the populated order with product data
      io.emit("order:created", populatedOrder);

      // Send response back with the new order details
      res.status(201).json({
        message: "Order placed successfully",
        order: {
          orderId: savedOrder._id,
          orderNo: savedOrder.orderNo, // Order number for the day
        },
      });
    } catch (error) {
      console.error("Error placing order:", error.message);
      res.status(500).json({ error: "Failed to place order. Please try again later." });
    }
  });

  //top selling items
  router.get("/top-products/:restaurantId", async (req, res) => {
    try {
      const { restaurantId } = req.params;
      const { dateRange } = req.query;

      // Validate restaurantId
      if (!isValidObjectId(restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }

      // Calculate start date based on dateRange
      const startDate = getDateRange(dateRange);

      // Aggregation pipeline to fetch top products
      const aggregationPipeline = [
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            status: "Served",
            ...(startDate && { createdAt: { $gte: startDate } }),
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            productId: "$_id",
            productName: "$productDetails.name",
            productImage: "$productDetails.img",
            totalQuantity: 1,
            _id: 0,
          },
        },
      ];

      // Execute the aggregation
      const topProducts = await Order.aggregate(aggregationPipeline);

      res.status(200).json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Error fetching top products" });
    }
  });

  // GET route: Fetch recent orders for a specific restaurant
  router.get("/:restaurantId", async (req, res) => {
    const { restaurantId } = req.params;
    const { customerIdentifier } = req.query;

    // Validate restaurantId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: "Invalid restaurantId" });
    }

    // Validate customerIdentifier
    if (!customerIdentifier) {
      return res.status(400).json({ error: "Customer identifier is required." });
    }

    try {
      // Get the start of the day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch orders from the start of the day up to now
      const recentOrders = await Order.find({
        restaurantId,
        customerIdentifier,
        createdAt: { $gte: startOfDay }, // Filter by today's orders
      })
        .select("orderNo total items status createdAt") // Include required fields
        .populate("items.productId", "name description img") // Populate product details
        .sort({ createdAt: -1 }); // Sort by most recent orders first

      res.status(200).json(recentOrders);
    } catch (error) {
      console.error("Error fetching customer orders:", error.message);
      res.status(500).json({ error: "Failed to fetch orders. Please try again later." });
    }
  });

  router.patch("/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ error: "Invalid order ID." });
    }

    if (!["Pending", "Preparing", "Served"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    try {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found." });
      }

      io.emit("order:updated", updatedOrder);

      res.status(200).json({
        message: "Order status updated successfully.",
        order: updatedOrder,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status." });
    }
  });

  return router;
};

export default configureOrderRoutes;
