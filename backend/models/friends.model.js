import mongoose from "mongoose";

/* ---------------- Friend Subdocument ---------------- */
const friendSchema = new mongoose.Schema(
    {
        friendUserId: {
            type: String,
            required: true,
        },
        requestStatus: {
            type: String,
            enum: ["req-sent", "req-rec", "accepted", "rejected", "canceled"],
            required: true,
        },
    },
    { _id: false }
);

/* ---------------- FriendRequest Root ---------------- */
const friendRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        friendsList: {
            type: [friendSchema],
            default: [],
        },
    },
    { timestamps: true }
);

const FriendRequest = mongoose.model(
    "FriendRequest",
    friendRequestSchema
);

export default FriendRequest;
