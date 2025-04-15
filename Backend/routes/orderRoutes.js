import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.js";
import authMiddleware from "../middlewares/authMiddlewares.js";
import moment from "moment";
import Product from '../models/product.js';
import RestaurantUser from '../models/restaurantUser.js';
import Restaurant from '../models/restaurant.js';

const router = express.Router();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to generate WhatsApp link
const generateWhatsAppLink = (phoneNumber, message) => {
  // Format phone number (remove spaces, add country code if needed)
  let formattedPhone = phoneNumber.replace(/\s+/g, '');
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+91' + formattedPhone; // Default to India, adjust as needed
  }
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Return WhatsApp API URL
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

// Helper function to send automated WhatsApp notification
const sendAutomatedWhatsAppNotification = async (phoneNumber, message, orderId) => {
  try {
    // Generate WhatsApp link
    const whatsappLink = generateWhatsAppLink(phoneNumber, message);
    
    // Store notification in database for tracking
    // This could be expanded to a Notification model if needed
    console.log(`WhatsApp notification link generated for order ${orderId}: ${whatsappLink}`);
    
    // In a real implementation, you could:
    // 1. Use a service like Twilio to send SMS with the WhatsApp link
    // 2. Use a browser automation tool to open the link (for testing)
    // 3. Store the notification in a database for tracking
    
    return whatsappLink;
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return null;
  }
};

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
          finalTotal: 1, // Include the finalTotal of the order
          createdAt: 1, // Include the created date of the order
        },
      },
    ];

    // Date grouping logic for different ranges (24h, week, month, year)
    if (dateRange === "24h") {
      aggregationPipeline.push({
        $group: {
          _id: null, // Single group for the entire 24 hours
          totalProfit: { $sum: "$finalTotal" }, // Sum the order finalTotals for the last 24 hours
        },
      });
    } else if (dateRange === "week" || dateRange === "month") {
      aggregationPipeline.push({
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
          totalProfit: { $sum: "$finalTotal" }, // Sum the order finalTotals for each day
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
          totalProfit: { $sum: "$finalTotal" }, // Sum the order finalTotals for each month
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

// Get all orders for a restaurant
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log('Fetching orders for restaurant:', restaurantId);

    if (!restaurantId) {
      return res.status(400).json({ error: "Restaurant ID is required" });
    }

    const orders = await Order.find({ restaurantId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.productId',
        select: 'name price img'
      })
      .populate('customerIdentifier', 'name email phone');

    console.log('Found orders:', orders.length);

    // Transform the orders to include product details
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.map(item => ({
        ...item.toObject(),
        productName: item.productId.name,
        productImage: item.productId.img,
        price: item.price
      }))
    }));

    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: "Failed to fetch orders",
      details: error.message
    });
  }
});

// Pass io to your route file if needed
const configureOrderRoutes = (io) => {

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
      taxRate,
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

    // Validate
    if (!customerIdentifier || !mongoose.Types.ObjectId.isValid(customerIdentifier)) {
      return res.status(400).json({ error: "Valid customer identifier is required." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required and must be a non-empty array." });
    }

    const sanitizedFinalTotal = parseFloat(finalTotal) || 0;
    if (isNaN(sanitizedFinalTotal) || sanitizedFinalTotal <= 0) {
      return res.status(400).json({ error: "Final total must be a positive number." });
    }

    try {
      // 👇 Step 1: Get IST start & end of the day
      const now = new Date();
      const IST_OFFSET = 5.5 * 60 * 60 * 1000; // +5:30 in ms
      const istNow = new Date(now.getTime() + IST_OFFSET);
      const istStartOfDay = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
      const utcStartOfDay = new Date(istStartOfDay.getTime() - IST_OFFSET);
      const utcEndOfDay = new Date(utcStartOfDay.getTime() + 24 * 60 * 60 * 1000);

      // 👇 Step 2: Get last orderNo for this restaurant today
      const latestOrder = await Order.findOne({
        restaurantId,
        createdAt: { $gte: utcStartOfDay, $lt: utcEndOfDay }
      })
        .sort({ orderNo: -1 })
        .select("orderNo");

      const orderNoToday = latestOrder ? latestOrder.orderNo + 1 : 1;

      // 👇 Step 3: Save new order with orderNo reset per day
      const newOrder = new Order({
        restaurantId,
        items,
        taxType: taxType || "none",
        itemsTotal: parseFloat(itemsTotal) || 0,
        discount: parseFloat(discount) || 0,
        gst: parseFloat(gst) || 0,
        finalTotal: sanitizedFinalTotal,
        excTaxRate: taxType === "exclusive" ? parseFloat(taxRate) || 0 : 0,
        serviceCharge: parseFloat(serviceCharge) || 0,
        packingCharge: parseFloat(packingCharge) || 0,
        deliveryCharge: parseFloat(deliveryCharge) || 0,
        tableNumber,
        paymentMethod: paymentMethod || "Unpaid",
        paymentStatus: paymentStatus || "Unpaid",
        refundStatus: refundStatus || "Not Applicable",
        modeOfOrder: modeOfOrder || "Dine-in",
        orderNotes: orderNotes || "",
        status: "Pending",
        customerIdentifier,
        orderNo: orderNoToday,
        createdAt: new Date() // always UTC
      });

      const savedOrder = await newOrder.save();

      // Update the user's lastVisit time in RestaurantUser collection
      await RestaurantUser.findOneAndUpdate(
        { userId: customerIdentifier, restaurantId },
        { 
          $inc: { visitCount: 1 },
          lastVisit: new Date()
        },
        { upsert: true }
      );

      // Get restaurant details for notification
      const restaurant = await Restaurant.findById(restaurantId);
      const customer = await RestaurantUser.findOne({ userId: customerIdentifier });

      // Prepare order details for notification
      const orderDetails = items.map(item => 
        `${item.quantity}x ${item.productId.name} - ₹${item.price * item.quantity}`
      ).join('\n');

      // Send notification to customer
      const customerMessage = `New Order #${savedOrder.orderNo}\n\nItems:\n${orderDetails}\n\nTotal: ₹${finalTotal}\n\nThank you for ordering from ${restaurant.name}!`;
      const customerWhatsAppLink = await sendAutomatedWhatsAppNotification(
        customer.phone, 
        customerMessage, 
        savedOrder._id
      );

      // Send notification to restaurant
      const restaurantMessage = `New Order #${savedOrder.orderNo}\n\nCustomer: ${customer.name}\nPhone: ${customer.phone}\n\nItems:\n${orderDetails}\n\nTotal: ₹${finalTotal}\n\nMode: ${modeOfOrder}\nTable: ${tableNumber || 'N/A'}`;
      const restaurantWhatsAppLink = await sendAutomatedWhatsAppNotification(
        restaurant.phone, 
        restaurantMessage, 
        savedOrder._id
      );

      await savedOrder.populate("customerIdentifier", "name");
      await savedOrder.populate("items.productId");

      io.emit("order:created", {
        ...savedOrder.toObject(),
        customerName: savedOrder.customerIdentifier?.name || "Guest",
        customerWhatsAppLink,
        restaurantWhatsAppLink
      });

      res.status(201).json({
        message: "Order placed successfully",
        order: {
          orderId: savedOrder._id,
          orderNo: savedOrder.orderNo,
          customerWhatsAppLink,
          restaurantWhatsAppLink
        },
      });

    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ error: "Something went wrong. Try again later." });
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
        // Add this in the final $project stage of fallback pipeline
        {
          $project: {
            productId: "$_id",
            productName: "$productDetails.name",
            productImage: "$productDetails.img",
            categoryId: "$productDetails.category",
            totalQuantity: 1,
            isRandom: { $literal: true }, // Add this flag
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
        .select("orderNo finalTotal items status createdAt") // Include required fields
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