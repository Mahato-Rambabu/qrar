import express from 'express';
import QRCode from 'qrcode'; // Ensure this library is installed and imported
import authMiddleware from '../middlewares/authMiddlewares.js';
import Restaurant from '../models/restaurant.js';

const router = express.Router();

router.get('/generate-qr', authMiddleware, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.user.id); // User ID from auth middleware
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        // Generate QR code with restaurant ID only
        const frontendBaseURL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
        const qrCodeUrl = `${frontendBaseURL}/home?restaurantId=${restaurant._id}`; // Embed restaurantId in the URL

        // Generate QR Code as Base64 image
        const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);

        res.status(200).json({ qrCodeUrl, qrCodeImage });
    } catch (error) {
        console.error('Error generating QR Code:', error.message);
        res.status(500).json({ error: 'Failed to generate QR Code. Please try again later.' });
    }
});

export default router;
