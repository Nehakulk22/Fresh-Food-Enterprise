const express = require("express");

const router = express.Router();

const {
    registerOwner,
    login
} = require("../controllers/authController");

// =====================================
// OWNER REGISTRATION
// =====================================

router.post(
    "/register-owner",
    registerOwner
);

// =====================================
// LOGIN
// =====================================

router.post(
    "/login",
    login
);

module.exports = router;