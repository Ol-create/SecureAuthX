import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/database.js";
import validateEnv from "./config/env.js";

validateEnv();
await connectDB();

const PORT = process.env.PORT || 4000;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`SecureAuthX running on port ${PORT}`);
});
