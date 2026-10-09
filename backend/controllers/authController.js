const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================
// Generate JWT Token
// =====================================

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

// =====================================
// REGISTER OWNER
// =====================================

const registerOwner = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required"
            });
        }

        // Check whether owner already exists

        const existingOwner = await User.findOne({
            role: "owner"
        });

        if (existingOwner) {
            return res.status(400).json({
                success: false,
                message:
                    "Owner account already exists"
            });
        }

        // Check email

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:
                    "Email already registered"
            });
        }

        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create owner

        const owner = await User.create({
            name: name.trim(),

            email:
                email.trim().toLowerCase(),

            password:
                hashedPassword,

            phone: phone || "",

            role: "owner",

            isActive: true,

            permissions: {
                dashboard: true,
                customers: true,
                suppliers: true,
                products: true,
                sales: true,
                purchases: true,
                payments: true,
                expenses: true,
                reports: true,
                staff: true,
                staffActivity: true,
                settings: true
            }
        });

        res.status(201).json({
            success: true,

            message:
                "Owner account created successfully",

            user: {
                id: owner._id,
                name: owner.name,
                email: owner.email,
                role: owner.role,
                permissions: owner.permissions
            }
        });

    } catch (error) {
        console.error(
            "Register owner error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// =====================================
// LOGIN
// =====================================

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });
        }

        const user = await User.findOne({
            email:
                email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        // Check active status

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is inactive."
            });
        }

        // Check password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        // Generate token

        const token =
            generateToken(user);

        res.json({
            success: true,

            message:
                "Login successful.",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,

                staffRole:
                    user.staffRole || "",

                permissions:
                    user.permissions || {}
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
    registerOwner,
    login
};