import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import healthRouter from "./routes/health.router.js";
import netAmountRouter from "./routes/netAmount.router.js"
import searchPersonRouter from "./routes/searchPerson.router.js"
import friendsRouter from "./routes/friends.router.js"
import clerkPersonRouter from "./routes/clerkPerson.router.js"
import upiRouter from "./routes/upiQr.router.js"

/* ---------------- CONFIG ---------------- */

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(cors());

/* ---------------- DATABASE ---------------- */

mongoose.set("strictQuery", true);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

/* ---------------- ROUTES ---------------- */

app.use("/health", healthRouter);
app.use("/api/net", netAmountRouter);
app.use("/api/search", searchPersonRouter);
app.use("/api/friend-request", friendsRouter);
app.use("/api/clerk-search", clerkPersonRouter);
app.use("/api/user/upi", upiRouter);

/* ---------------- START SERVER ---------------- */

connectDB().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 App started at http://localhost:${PORT}`);
    });
});
