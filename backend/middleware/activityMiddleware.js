const logActivity = require("../controllers/activityController");

const activityMiddleware = (moduleName) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        if (
          req.user &&
          req.user.role === "staff" &&
          ["POST", "PUT", "PATCH", "DELETE"].includes(
            req.method
          ) &&
          res.statusCode >= 200 &&
          res.statusCode < 300
        ) {
          const data =
            body?.sale ||
            body?.purchase ||
            body?.payment ||
            body?.customer ||
            body?.supplier ||
            body?.product ||
            body?.staff ||
            body?.data ||
            body;

          const recordId =
            data?._id ||
            data?.id ||
            null;

          let action = "CREATE";

          if (
            req.method === "PUT" ||
            req.method === "PATCH"
          ) {
            action = "UPDATE";
          }

          if (req.method === "DELETE") {
            action = "DELETE";
          }

          let description = `${moduleName} ${action.toLowerCase()}d`;

          if (moduleName === "Sale") {
            description = `Staff ${action.toLowerCase()}d a sale`;
          }

          if (moduleName === "Purchase") {
            description = `Staff ${action.toLowerCase()}d a purchase`;
          }

          if (moduleName === "Payment") {
            description = `Staff ${action.toLowerCase()}d a payment`;
          }

          if (moduleName === "Customer") {
            description = `Staff ${action.toLowerCase()}d a customer`;
          }

          if (moduleName === "Supplier") {
            description = `Staff ${action.toLowerCase()}d a supplier`;
          }

          if (moduleName === "Product") {
            description = `Staff ${action.toLowerCase()}d a product`;
          }

          const referenceNumber =
            data?.invoiceNumber ||
            data?.transactionId ||
            req.body?.invoiceNumber ||
            "";

          const amount =
            data?.amount ??
            data?.totalAmount ??
            req.body?.amount ??
            req.body?.totalAmount ??
            null;

          await logActivity({
            user: req.user,
            module: moduleName,
            action,
            description,
            recordId,
            recordType: moduleName,
            referenceNumber,
            amount,
            metadata: {
              method: req.method,
              path: req.originalUrl,
            },
          });
        }
      } catch (error) {
        console.error(
          "Automatic activity tracking error:",
          error.message
        );
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = activityMiddleware;