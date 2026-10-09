const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");

const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const staffRoutes = require("./routes/staffRoutes");
const activityRoutes = require("./routes/activityRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

dotenv.config();

connectDB();

const app = express();

// =====================================
// Middleware
// =====================================

app.use(cors());

app.use(express.json());

// =====================================
// Test Route
// =====================================

app.get("/", (req, res) => {
    res.json({
        message: "FreshLedger Backend is running"
    });
});

// =====================================
// Authentication Routes
// =====================================

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

<<<<<<< Updated upstream
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales",saleRoutes)
=======
// =====================================
// Application Routes
// =====================================

app.use("/api/customers", customerRoutes);

app.use("/api/suppliers", supplierRoutes);

app.use("/api/products", productRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/sales", saleRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/staff", staffRoutes);

app.use("/api/activities", activityRoutes);

app.use("/api/settings", settingsRoutes);

// =====================================
>>>>>>> Stashed changes
// Server
// =====================================

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});