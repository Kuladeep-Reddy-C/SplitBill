import mongoose from "mongoose";

const userBalanceSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true, // one record per user
            index: true,
        },
        owed: {
            type: Number,
            default: 0,
        },
        lent: {
            type: Number,
            default: 0,
        },
        notifications: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

const UserBalance = mongoose.model("UserBalance", userBalanceSchema);

export default UserBalance;
