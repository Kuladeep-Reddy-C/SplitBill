import express from 'express'
import UserBalance from '../models/netAmount.model.js';

const router = express.Router();
router.post("/Qr", async (req, res) => {
    const { userId, upiQrUrl } = req.body;

    const resp = await UserBalance.findOneAndUpdate(
        { userId },
        { upiQrUrl },
        { upsert: true }
    );

    res.json({ success: true, resp });
});

router.post("/id", async (req, res) => {
    const { userId, upiId } = req.body;

    if (!userId || !upiId) {
        return res.status(400).json({ error: "Missing data" });
    }

    const resp = await UserBalance.findOneAndUpdate(
        { userId },
        { upiId },
        { upsert: true, new: true }
    );

    res.json({ success: true, resp });
});


router.delete("/:userId", async (req, res) => {
    const { userId } = req.params;

    await UserBalance.findOneAndUpdate(
        { userId },
        { upiQrUrl: null }
    );

    res.json({ success: true });
});


export default router;