import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send({ message: "Server is running Good!" });
});

export default router;