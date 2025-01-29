
// Middleware to validate customer
const validateCustomer = (req, res, next) => {
    const customerIdentifier = req.cookies.customerIdentifier;

    if (!customerIdentifier) {
        return res.status(400).json({ error: "Customer identifier not found. Please reload the page." });
    }

    req.customerIdentifier = customerIdentifier;
    next();
};

export default validateCustomer;