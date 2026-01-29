import express from "express";
import mongoose from "mongoose";
import Group from "../models/group.model.js";

const router = express.Router();

/* ======================================================
   CREATE GROUP
   POST /api/groups
   ====================================================== */
router.post("/", async (req, res) => {
    try {
        const { name, description, userId } = req.body;

        if (!name || !userId) {
            return res.status(400).json({ error: "name and userId are required" });
        }

        const group = await Group.create({
            name,
            description,
            createdBy: userId,
            members: [
                {
                    userId,
                    role: "admin",
                },
            ],
        });

        res.status(201).json(group);
    } catch (err) {
        console.error("CREATE GROUP ERROR:", err);
        res.status(500).json({ error: "Failed to create group" });
    }
});

/* ======================================================
   GET ALL GROUPS FOR A USER
   GET /api/groups/user/:userId
   ====================================================== */
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const groups = await Group.find({
            members: {
                $elemMatch: {
                    userId,
                    status: "active",
                },
            },
        }).sort({ updatedAt: -1 });


        res.json(groups);
    } catch (err) {
        console.error("FETCH USER GROUPS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
});

/* ======================================================
   GET SINGLE GROUP (FULL DOCUMENT)
   GET /api/groups/:groupId
   ====================================================== */
router.get("/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: "Invalid groupId" });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        res.json(group);
    } catch (err) {
        console.error("FETCH GROUP ERROR:", err);
        res.status(500).json({ error: "Failed to fetch group" });
    }
});

/* ======================================================
   UPDATE GROUP (FIRST LAYER ONLY)
   PUT /api/groups/:groupId

   ⚠️ DO NOT UPDATE:
   - feasts
   - members balances
   ====================================================== */
router.put("/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: "Invalid groupId" });
        }

        const updates = {};
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (status) updates.status = status;

        const group = await Group.findByIdAndUpdate(
            groupId,
            { $set: updates },
            { new: true }
        );

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        res.json(group);
    } catch (err) {
        console.error("UPDATE GROUP ERROR:", err);
        res.status(500).json({ error: "Failed to update group" });
    }
});

/* ======================================================
   DELETE ENTIRE GROUP (ONLY ALLOWED DELETE)
   DELETE /api/groups/:groupId

   ⚠️ This deletes:
   - group
   - members
   - feasts
   ====================================================== */
router.delete("/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ error: "Invalid groupId" });
        }

        const group = await Group.findByIdAndDelete(groupId);

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("DELETE GROUP ERROR:", err);
        res.status(500).json({ error: "Failed to delete group" });
    }
});

export default router;
