import express from 'express'
import Group from '../models/group.model';

// 3️⃣ SETTLEMENT ROUTER(THE LEDGER)
// 🧠 What settlement really is

// A payment event, not an edit.

// ➕ Add settlement
// POST / groups /: groupId / settlements

// Payload:

// fromUser

// toUser
// amount

const router = express.Router();

router.post("/:groupId/settlements", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { fromUser, toUser, amount } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: "Group not found" });

        const feastFriends = [
            {
                userId: toUser,
                balanceAmount: amount,
                settledAmount: amount,
                remainingAmount: 0,
            },
            {
                userId: fromUser,
                balanceAmount: -amount,
                settledAmount: amount,
                remainingAmount: 0,
            },
        ];

        group.feasts.push({
            title: `${fromUser} paid ${toUser}`,
            type: "settlement",
            paidBy: [{ userId: fromUser, amount }],
            totalAmountFeast: amount,
            feastFriends,
            status: "settled",
            createdBy: fromUser,
        });

        await group.save();
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: "Failed to settle" });
    }
});


export default router;