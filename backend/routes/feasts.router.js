import express from 'express'
import Group from '../models/group.model.js';

// ➕ Add feast(expense)
// POST / groups /: groupId / feasts

// Payload:

// title

// paidBy[]

// feastFriends[] with items

const router = express.Router();

// 🟡 CREATE DRAFT FEAST
// POST /api/groups/:groupId/feasts/draft
router.post("/:groupId/feasts/draft", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title = "Draft Feast", createdBy } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        const newFeast = {
            title,
            createdBy,
            status: "draft",          // 🔑 IMPORTANT
            type: "feast",
            paidBy: [],
            feastFriends: [],
            totalAmountFeast: 0,
            adjustmentAmount: 0,
        };

        group.feasts.push(newFeast);
        await group.save();

        // get the last pushed feast
        const feast =
            group.feasts[group.feasts.length - 1];

        res.json({
            success: true,
            feastId: feast.feastId,
            feast,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create draft feast" });
    }
});

router.get("/:groupId/feasts", async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .select("feasts");

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        res.json(group.feasts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch feasts" });
    }
});

router.post("/:groupId/feasts", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title, paidBy, feastFriends, adjustmentAmount = 0 } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found" });

        // 1️⃣ Calculate consumed amount per friend
        feastFriends.forEach(f => {
            f.totalConsumedAmount = f.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
        });

        const totalAmountFeast =
            feastFriends.reduce((s, f) => s + f.totalConsumedAmount, 0) +
            adjustmentAmount;

        // 2️⃣ Calculate balances
        feastFriends.forEach(f => {
            const paid = paidBy
                .filter(p => p.userId === f.userId)
                .reduce((s, p) => s + p.amount, 0);

            f.balanceAmount = paid - f.totalConsumedAmount;
            f.settledAmount = 0;
            f.remainingAmount = Math.abs(f.balanceAmount);
        });

        // 3️⃣ Push feast
        group.feasts.push({
            title,
            type: "feast",
            paidBy,
            totalAmountFeast,
            adjustmentAmount,
            feastFriends,
            status: "open",
            createdBy: req.body.createdBy,
        });

        // 4️⃣ Update group totals
        group.totalAmount += totalAmountFeast;

        await group.save();
        res.json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add feast" });
    }
});


// ✔ No feast deletion
// ✔ Append - only
// ✔ All math stored


export default router;