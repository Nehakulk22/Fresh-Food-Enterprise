const Activity = require("../models/StaffActivity");

const logActivity = async ({
  userId,
  staffName,
  staffEmail = "",
  module,
  action,
  description,
  recordId = null,
  recordType = "",
  invoiceNumber = "",
  amount = null,
  endpoint = "",
  method = "",
  metadata = {},
}) => {
  try {
    // Do not create an activity without a logged-in user.
    if (!userId) {
      return;
    }

    await Activity.create({
      user: userId,
      staffName: staffName || "Unknown User",
      staffEmail: staffEmail || "",
      module,
      action,
      description,
      recordId,
      recordType,
      invoiceNumber,
      amount:
        amount !== null && amount !== undefined
          ? Number(amount)
          : null,
      endpoint,
      method,
      metadata,
    });
  } catch (error) {
    // Activity logging should never break the actual business operation.
    console.error("Activity logging error:", error.message);
  }
};

module.exports = logActivity;