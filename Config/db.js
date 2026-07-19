const mongoose = require("mongoose");

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/fee_management";

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((err) => {
    console.error("Database not Connected:", err.message || err);
    process.exit(1);
  });

module.exports = mongoose;
