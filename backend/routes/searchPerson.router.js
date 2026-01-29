import express from 'express';

const router = express.Router();

router.get('/:name', async (req, res) => {
    const { name } = req.params;

    if (!name?.trim()) {
        return res.status(400).json({ error: 'Missing name' });
    }

    try {
        const response = await fetch(
            `https://api.clerk.dev/v1/users?query=${encodeURIComponent(
                name.trim()
            )}&limit=20`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Clerk API error');
        }

        const users = await response.json();

        /* 🔥 Transform Clerk users → frontend-safe payload */
        const formattedUsers = users.map((user) => {
            const firstName =
                user.unsafe_metadata?.firstName ??
                user.first_name ??
                '';

            const lastName =
                user.unsafe_metadata?.lastName ??
                user.last_name ??
                '';

            return {
                userId: user.id,
                fullName: `${firstName} ${lastName}`.trim(),
                userName: `${user.first_name} ${user.last_name}`.trim(),
                unsafeMetadata: user.unsafe_metadata ?? {},
                email:
                    user.email_addresses?.[0]?.email_address ?? '',
                imageUrl:
                    user.image_url ??
                    user.profile_image_url ??
                    null,
            };
        });

        res.status(200).json(formattedUsers);
    } catch (err) {
        console.error('User search failed:', err);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

export default router;
