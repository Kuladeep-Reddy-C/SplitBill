import express from "express";
import FriendRequest from "../models/friends.model.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        let fr = await FriendRequest.findOne({ userId });

        // If user has no document yet → return empty list
        if (!fr) {
            return res.status(200).json({
                success: true,
                data: {
                    userId,
                    friendsList: [],
                },
            });
        }

        let friendsList = fr.friendsList;

        // Optional status filter
        if (status) {
            friendsList = friendsList.filter(
                (f) => f.requestStatus === status
            );
        }

        return res.status(200).json({
            success: true,
            data: {
                userId: fr.userId,
                friendsList,
            },
        });
    } catch (error) {
        console.error("Error fetching friends:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});


const getOrCreate = async (userId) => {
    let doc = await FriendRequest.findOne({ userId });
    if (!doc) {
        doc = await FriendRequest.create({ userId, friendsList: [] });
    }
    return doc;
};


router.post("/", async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;

        if (!fromUserId || !toUserId) {
            return res.status(400).json({
                success: false,
                message: "fromUserId and toUserId are required",
            });
        }

        if (fromUserId === toUserId) {
            return res.status(400).json({
                success: false,
                message: "Cannot send request to yourself",
            });
        }

        const fromUser = await getOrCreate(fromUserId);
        const toUser = await getOrCreate(toUserId);

        // Prevent duplicate requests
        const exists = fromUser.friendsList.some(
            f => f.friendUserId === toUserId
        );

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Friend request already exists",
            });
        }

        // Add to both users
        fromUser.friendsList.push({
            friendUserId: toUserId,
            requestStatus: "req-sent",
        });

        toUser.friendsList.push({
            friendUserId: fromUserId,
            requestStatus: "req-rec",
        });

        await fromUser.save();
        await toUser.save();

        return res.status(200).json({
            success: true,
            message: "Friend request sent",
        });
    } catch (err) {
        console.error("Send request error:", err);
        res.status(500).json({ success: false });
    }
});

/* -------------------------------------------------- */
/* 2️⃣ UPDATE FRIEND REQUEST */
/* accept | reject | cancel */
/* -------------------------------------------------- */
router.put("/", async (req, res) => {
    try {
        const { userId, friendUserId, action } = req.body;

        if (!userId || !friendUserId || !action) {
            return res.status(400).json({
                success: false,
                message: "userId, friendUserId, action required",
            });
        }

        const user = await FriendRequest.findOne({ userId });
        const friend = await FriendRequest.findOne({ userId: friendUserId });

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found",
            });
        }

        /* ---------------- ACCEPT ---------------- */
        if (action === "accept") {
            user.friendsList.forEach(f => {
                if (f.friendUserId === friendUserId) {
                    f.requestStatus = "accepted";
                }
            });

            friend.friendsList.forEach(f => {
                if (f.friendUserId === userId) {
                    f.requestStatus = "accepted";
                }
            });
        }

        /* ---------------- REJECT / CANCEL ---------------- */
        if (action === "reject" || action === "cancel") {
            user.friendsList = user.friendsList.filter(
                f => f.friendUserId !== friendUserId
            );

            friend.friendsList = friend.friendsList.filter(
                f => f.friendUserId !== userId
            );
        }

        await user.save();
        await friend.save();

        return res.status(200).json({
            success: true,
            message: `Friend request ${action}ed`,
        });
    } catch (err) {
        console.error("Update request error:", err);
        res.status(500).json({ success: false });
    }
});

export default router;
