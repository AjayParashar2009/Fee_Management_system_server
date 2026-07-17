const mongoose = require("mongoose");

mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/fee_management",
  )
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch(() => {
    console.log("Database not Connected");
  });

module.exports = mongoose;
