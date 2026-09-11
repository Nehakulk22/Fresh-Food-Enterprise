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
                message:
                    "Owner account already exists"
            });

        }


        // Check email

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email already registered"
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create owner

        const owner = await User.create({

            name,

            email:
                email.toLowerCase(),

            password:
                hashedPassword,

            phone,

            role: "owner",

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

            message:
                "Owner account created successfully",

            user: {

                id: owner._id,

                name: owner.name,

                email: owner.email,

                role: owner.role

            }

        });


    } catch (error) {

        console.error(
            "Register owner error:",
            error
        );

        res.status(500).json({
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
                message:
                    "Email and password are required"
            });

        }


        const user = await User.findOne({
            email: email.toLowerCase()
        });


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        if (!user.isActive) {

            return res.status(403).json({
                message:
                    "Your account has been deactivated"
            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const token =
            generateToken(user);


        res.status(200).json({

            message:
                "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role,

                permissions:
                    user.permissions

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
};


module.exports = {
    registerOwner,
    login
};