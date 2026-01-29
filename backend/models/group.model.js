import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
    {
        /* =========================
           BASIC GROUP INFO
        ========================= */
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        createdBy: {
            type: String, // Clerk userId
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "settled", "archived"],
            default: "active",
        },

        /* =========================
           GROUP MEMBERS
        ========================= */
        members: [
            {
                userId: {
                    type: String,
                    required: true,
                },

                role: {
                    type: String,
                    enum: ["admin", "member"],
                    default: "member",
                },

                status: {
                    type: String,
                    enum: ["active", "left"],
                    default: "active",
                },

                // 🔥 cached per-group summary
                spent: {
                    type: Number,
                    default: 0,
                },

                owed: {
                    type: Number,
                    default: 0,
                },

                lent: {
                    type: Number,
                    default: 0,
                },

                joinedAt: {
                    type: Date,
                    default: Date.now,
                },

                leftAt: {
                    type: Date,
                    default: null,
                },
            },
        ],

        /* =========================
           GROUP TOTALS (CACHED)
        ========================= */
        totalAmount: {
            type: Number,
            default: 0,
        },

        /* =========================
           FEASTS / EXPENSES
        ========================= */
        feasts: [
            {
                feastId: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: () => new mongoose.Types.ObjectId(),
                },

                title: {
                    type: String,
                    required: true,
                },

                createdBy: {
                    type: String, // userId
                    required: true,
                },

                type: {
                    type: String,
                    enum: ["feast", "settlement"],
                    default: "feast",
                },

                status: {
                    type: String,
                    enum: ["open", "settled", "draft"],
                    default: "open",
                },

                /* =========================
                   WHO PAID (supports multi-payer)
                ========================= */
                paidBy: [
                    {
                        userId: {
                            type: String,
                            required: true,
                        },
                        amount: {
                            type: Number,
                            required: true,
                        },
                    },
                ],

                /* =========================
                   FEAST AMOUNTS
                ========================= */
                totalAmountFeast: {
                    type: Number,
                    required: true,
                },

                adjustmentAmount: {
                    type: Number,
                    default: 0, // tax, tip, rounding
                },

                /* =========================
                   FEAST FRIENDS
                ========================= */
                feastFriends: [
                    {
                        userId: {
                            type: String,
                            required: true,
                        },

                        status: {
                            type: String,
                            enum: ["active", "left"],
                            default: "active",
                        },

                        /* =========================
                           ITEMS CONSUMED
                        ========================= */
                        items: [
                            {
                                name: {
                                    type: String,
                                    required: true,
                                },
                                price: {
                                    type: Number,
                                    required: true,
                                },
                                quantity: {
                                    type: Number,
                                    required: true,
                                },
                            },
                        ],

                        totalConsumedAmount: {
                            type: Number,
                            default: 0,
                        },

                        /* =========================
                           FINANCIAL RESULT (THIS FEAST)
                           +ve → lent
                           -ve → owe
                        ========================= */
                        balanceAmount: {
                            type: Number,
                            default: 0,
                        },

                        settledAmount: {
                            type: Number,
                            default: 0,
                        },

                        remainingAmount: {
                            type: Number,
                            default: 0,
                        },
                    },
                ],

                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Group", GroupSchema);
