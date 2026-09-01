const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

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


// Server

const PORT =
    process.env.PORT || 8000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});