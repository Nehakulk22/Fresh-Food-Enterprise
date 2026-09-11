const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");

dotenv.config();

connectDB();

const app = express();


// Middleware

app.use(cors());

app.use(express.json());


// Test route

app.get("/", (req, res) => {

    res.json({
        message:
            "FreshLedger Backend is running"
    });

});


// Authentication routes

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales",saleRoutes)
// Server

const PORT =
    process.env.PORT || 8000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});