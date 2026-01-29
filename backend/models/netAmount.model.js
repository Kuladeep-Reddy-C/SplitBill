import mongoose from "mongoose";

const userBalanceSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        // Money
        owed: {
            type: Number,
            default: 0,
        },
        lent: {
            type: Number,
            default: 0,
        },

        // Notifications
        notifications: {
            type: Boolean,
            default: false,
        },

        // UPI Info
        upiId: {
            type: String,
            default: null, // example: name@okaxis
        },

        upiQrUrl: {
            type: String,
            default: null, // Firebase Storage URL
        },
    },
    {
        timestamps: true,
    }
);

const UserBalance = mongoose.model("UserBalance", userBalanceSchema);
export default UserBalance;
