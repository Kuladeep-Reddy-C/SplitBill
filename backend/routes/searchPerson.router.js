import express from 'express'

const router = express.Router();

router.get('/:name', async (req, res) => {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: 'Missing name' });

    try {
        const response = await fetch(
            `https://api.clerk.dev/v1/users?query=${encodeURIComponent(name.trim())}&limit=20`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) throw new Error('Clerk API error');

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;