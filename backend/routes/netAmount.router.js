import express from "express";
import UserBalance from "../models/netAmount.model.js"; // your model file

const router = express.Router();

/**
 * GET /api/net/:userId
 * Returns user balance + notifications
 * Creates record with defaults if not exists
 */
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        let userBalance = await UserBalance.findOne({ userId });

        if (!userBalance) {
            userBalance = await UserBalance.create({
                userId,
                owed: 0,
                lent: 0,
                notifications: false, // default from schema
            });
        }

        return res.status(200).json(userBalance);
    } catch (error) {
        console.error("GET UserBalance error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * PATCH /api/net/:userId
 * Updates fields (notifications for now, extensible later)
 * Returns updated document
 */
router.patch("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body; // { notifications: true/false, ... }

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Optional: validate allowed fields
        const allowedUpdates = ["notifications", "owed", "lent"];
        const isValidOperation = Object.keys(updates).every((key) =>
            allowedUpdates.includes(key)
        );

        if (!isValidOperation) {
            return res.status(400).json({ message: "Invalid update fields" });
        }

        const updatedBalance = await UserBalance.findOneAndUpdate(
            { userId },
            { $set: updates },
            { new: true, runValidators: true, upsert: true } // upsert = create if missing
        );

        if (!updatedBalance) {
            return res.status(404).json({ message: "User balance not found" });
        }

        return res.status(200).json(updatedBalance);
    } catch (error) {
        console.error("PATCH UserBalance error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;