import Group from "../models/group.model.js";
import express from 'express'

const router = express.Router()

// ➕ Add member to group
// POST / groups /: groupId / members
router.post("/:groupId/members", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId, role = "member" } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found" });

        const exists = group.members.find(m => m.userId === userId);
        if (exists) {
            return res.status(400).json({ error: "User already in group" });
        }

        group.members.push({
            userId,
            role,
            joinedAt: new Date(),
        });

        await group.save();
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: "Failed to add member" });
    }
});

// 🔄 Change member role
// PUT / groups /: groupId / members /: userId / role

router.put("/:groupId/members/:userId/role", async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const { role } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found" });

        const member = group.members.find(m => m.userId === userId);
        if (!member) return res.status(404).json({ error: "Member not found" });

        member.role = role;
        await group.save();

        res.json(group);
    } catch (err) {
        res.status(500).json({ error: "Failed to update role" });
    }
});

// 🚪 Member leaves group(IMPORTANT)
// PUT / groups /: groupId / members /: userId / leave

router.put("/:groupId/members/:userId/leave", async (req, res) => {
    try {
        const { groupId, userId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found" });

        const member = group.members.find(m => m.userId === userId);
        if (!member) return res.status(404).json({ error: "Member not found" });

        member.status = "left";
        member.leftAt = new Date();

        await group.save();
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: "Failed to leave group" });
    }
});

export default router;