import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import authMiddleware from "../middlewares/authMiddlewares.js";
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
      .populate("items.productId", "name description img price")
      .select("orderNo itemsTotal discount gst finalTotal serviceCharge packingCharge deliveryCharge items status updatedAt customerIdentifier paymentMethod paymentStatus modeOfOrder tableNumber orderNotes")
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
      .populate("items.productId", "name description img price")
      .select("orderNo itemsTotal discount gst finalTotal serviceCharge packingCharge deliveryCharge items status createdAt customerIdentifier paymentMethod paymentStatus modeOfOrder tableNumber orderNotes")
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
    const {
      items,
      finalTotal,
      taxType,
      itemsTotal,
      discount,
      gst,
      customerIdentifier,
      taxRate, // for exclusive tax
      serviceCharge,
      packingCharge,
      deliveryCharge,
      tableNumber,
      paymentMethod,
      paymentStatus,
      refundStatus,
      modeOfOrder,
      orderNotes
    } = req.body;

    // Validate customerIdentifier
    if (!customerIdentifier || !mongoose.Types.ObjectId.isValid(customerIdentifier)) {
      return res.status(400).json({ error: "Valid customer identifier is required." });
    }

    // Validate items and finalTotal
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required and must be a non-empty array." });
    }

    // Ensure all numeric values are properly formatted
    const sanitizedItemsTotal = parseFloat(itemsTotal) || 0;
    const sanitizedDiscount = parseFloat(discount) || 0;
    const sanitizedGst = parseFloat(gst) || 0;
    const sanitizedFinalTotal = parseFloat(finalTotal) || 0;
    const sanitizedTaxRate = parseFloat(taxRate) || 0;
    const sanitizedServiceCharge = parseFloat(serviceCharge) || 0;
    const sanitizedPackingCharge = parseFloat(packingCharge) || 0;
    const sanitizedDeliveryCharge = parseFloat(deliveryCharge) || 0;

    // Log sanitized values
    // console.log("Sanitized values:", {
    //   itemsTotal: sanitizedItemsTotal,
    //   discount: sanitizedDiscount,
    //   gst: sanitizedGst,
    //   finalTotal: sanitizedFinalTotal,
    //   taxRate: sanitizedTaxRate,
    //   serviceCharge: sanitizedServiceCharge,
    //   packingCharge: sanitizedPackingCharge,
    //   deliveryCharge: sanitizedDeliveryCharge
    // });

    // Validate finalTotal
    if (isNaN(sanitizedFinalTotal) || sanitizedFinalTotal <= 0) {
      return res.status(400).json({ error: "Final total is required and must be a positive number." });
    }

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const orderCount = await Order.countDocuments({
        createdAt: { $gte: startOfDay },
        restaurantId,
      });

      const newOrder = new Order({
        restaurantId,
        items, // Each item may include its own taxRate (for inclusive tax)
        taxType: taxType || "none",
        itemsTotal: sanitizedItemsTotal,
        discount: sanitizedDiscount,
        gst: sanitizedGst,
        finalTotal: sanitizedFinalTotal,
        // For exclusive tax orders, store the restaurant-level tax rate in excTaxRate.
        excTaxRate: taxType === "exclusive" ? sanitizedTaxRate : 0,
        status: "Pending",
        orderNo: orderCount + 1,
        customerIdentifier,
        // New fields with defaults or values provided from the request:
        serviceCharge: sanitizedServiceCharge,
        packingCharge: sanitizedPackingCharge,
        deliveryCharge: sanitizedDeliveryCharge,
        tableNumber, // remains optional
        paymentMethod: paymentMethod || "Unpaid",
        paymentStatus: paymentStatus || "Unpaid",
        refundStatus: refundStatus || "Not Applicable",
        modeOfOrder: modeOfOrder || "Dine-in",
        orderNotes: orderNotes || "",
        createdAt: new Date(),
      });

      const savedOrder = await newOrder.save();

      await savedOrder.populate("customerIdentifier", "name");
      await savedOrder.populate("items.productId");

      const populatedOrder = {
        ...savedOrder.toObject(),
        customerName: savedOrder.customerIdentifier.name || "Guest",
      };

      io.emit("order:created", populatedOrder);

      res.status(201).json({
        message: "Order placed successfully",
        order: {
          orderId: savedOrder._id,
          orderNo: savedOrder.orderNo,
        },
      });
    } catch (error) {
      console.error("Error placing order:", error.message);
      res.status(500).json({ error: "Failed to place order. Please try again later." });
    }
  });

  // Weekly popular items
  router.get("/top-products/:restaurantId", async (req, res) => {
    try {
      const { restaurantId } = req.params;

      // Validate restaurantId
      if (!isValidObjectId(restaurantId)) {
        return res.status(400).json({ message: "Invalid restaurant ID" });
      }

      // Calculate start date for last 7 days
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Aggregation pipeline for last 7 days
      const weeklyPipeline = [
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            status: "Served",
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" },
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          }
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            productId: "$_id",
            productName: "$productDetails.name",
            productImage: "$productDetails.img",
            categoryId: "$productDetails.category",
            totalQuantity: 1,
            _id: 0,
          }
        },
      ];

      // Fallback pipeline (e.g., all-time top 3, ignoring date)
      const fallbackPipeline = [
        {
          $match: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            status: "Served",
            // No date filter
          }
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" },
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          }
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            productId: "$_id",
            productName: "$productDetails.name",
            productImage: "$productDetails.img",
            categoryId: "$productDetails.category",
            totalQuantity: 1,
            _id: 0,
          }
        },
      ];

      // Execute the weekly aggregator
      let weeklyPopularProducts = await Order.aggregate(weeklyPipeline);

      // If empty, use fallback aggregator
      if (weeklyPopularProducts.length === 0) {
        console.log("No served orders found in the last 7 days. Using fallback.");
        weeklyPopularProducts = await Order.aggregate(fallbackPipeline);
      }

      res.status(200).json(weeklyPopularProducts);
    } catch (error) {
      console.error("Error fetching weekly popular products:", error);
      res.status(500).json({ message: "Error fetching weekly popular products" });
    }
  });

  // GET route: Fetch all orders for a specific restaurant and customer (all time)
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
      // Fetch orders for all time (no date filter)
      const orders = await Order.find({
        restaurantId,
        customerIdentifier,
      })
        .select("orderNo total items status createdAt") // Include required fields
        .populate("items.productId", "name description img") // Populate product details
        .sort({ createdAt: -1 }); // Sort by most recent orders first

      res.status(200).json(orders);
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

    // Allow "Rejected" as a valid status now
    if (!["Pending", "Preparing", "Served", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

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
