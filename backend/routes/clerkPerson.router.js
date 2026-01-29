import express from "express";
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'

const router = express.Router();

/**
 * GET /api/clerk-user/:userId
 * Fetch Clerk user details securely
 */
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

        const user = await clerkClient.users.getUser(userId);

        return res.status(200).json({
            success: true,
            data: {
                userId: user.id,
                fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
                username: user.username,
                email:
                    user.emailAddresses?.[0]?.emailAddress ?? null,
                imageUrl: user.imageUrl,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Clerk fetch user error:", error);

        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
});

export default router;
