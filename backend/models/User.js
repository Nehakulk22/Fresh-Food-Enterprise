const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["owner", "staff"],
            default: "staff"
        },

        phone: {
            type: String,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: true
        },

        permissions: {
            dashboard: {
                type: Boolean,
                default: true
            },

            customers: {
                type: Boolean,
                default: false
            },

            suppliers: {
                type: Boolean,
                default: false
            },

            products: {
                type: Boolean,
                default: false
            },

            sales: {
                type: Boolean,
                default: false
            },

            purchases: {
                type: Boolean,
                default: false
            },

            payments: {
                type: Boolean,
                default: false
            },

            expenses: {
                type: Boolean,
                default: false
            },

            reports: {
                type: Boolean,
                default: false
            },

            staff: {
                type: Boolean,
                default: false
            },

            staffActivity: {
                type: Boolean,
                default: false
            },

            settings: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);