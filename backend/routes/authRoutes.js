const express = require("express");

const router = express.Router();

const {
    registerOwner,
    login
} = require("../controllers/authController");


// Register first owner

router.post(
    "/register-owner",
    registerOwner
);


// Login

router.post(
    "/login",
    login
);


module.exports = router;