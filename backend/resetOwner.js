const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const resetOwnerPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    const owner = await User.findOne({
      role: "owner"
    });

    if (!owner) {
      console.log("Owner account not found");
      process.exit(1);
    }

    const newPassword = "Owner@123";

    owner.password = await bcrypt.hash(
      newPassword,
      10
    );

    await owner.save();

    console.log("--------------------------------");
    console.log("Owner password reset successfully");
    console.log("Owner email:", owner.email);
    console.log("Temporary password: Owner@123");
    console.log("--------------------------------");

    process.exit(0);

  } catch (error) {
    console.error("Password reset error:", error);
    process.exit(1);
  }
};

resetOwnerPassword();