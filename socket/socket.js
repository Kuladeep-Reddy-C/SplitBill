import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔗 DB connection (same DB as API)
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once("open", () => {
    console.log("🟢 Socket DB connected");
});

const io = new Server(server, {
    cors: { origin: "*" },
});

// Health check (important for Render)
app.get("/health", (_, res) => {
    res.json({ socket: "ok" });
});

io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("group:join", ({ groupId }) => {
        socket.join(`group:${groupId}`);
    });

    socket.on("feast:join", ({ feastId, user }) => {
        const room = `feast:${feastId}`;

        console.log("🟡 SERVER feast:join received");
        console.log("   socket.id =", socket.id);
        console.log("   feastId   =", feastId);
        console.log("   room      =", room);
        console.log("   user      =", user);

        socket.join(room);

        const rooms = Array.from(socket.rooms);
        console.log("🟢 SERVER socket rooms after join:", rooms);

        io.to(room).emit("chat:system", {
            message: `${user.name} joined feast`,
            time: Date.now(),
        });
    });



    socket.on("chat:message", (payload) => {
        console.log("🟡 SERVER chat:message received");
        console.log(payload);

        const room = `feast:${payload.id}`;
        console.log("🟡 SERVER emitting to room:", room);

        io.to(room).emit("chat:message", {
            ...payload,
            time: Date.now(),
        });
    });


    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log("🚀 Socket server running on 5000");
});
