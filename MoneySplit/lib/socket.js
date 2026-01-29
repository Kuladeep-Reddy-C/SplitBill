import { io } from "socket.io-client";

export const socket = io("http://10.12.150.244:5000", {
    transports: ["polling"], // 👈 IMPORTANT
    autoConnect: false,
});

socket.on("connect", () => {
    console.log("🟢 CLIENT socket connected:", socket.id);
});

socket.on("disconnect", () => {
    console.log("🔴 CLIENT socket disconnected");
});

socket.on("connect_error", (err) => {
    console.log("❌ CLIENT socket connect error:", err.message);
});
