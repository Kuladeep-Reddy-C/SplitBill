import { Server } from "socket.io";
import registerConnectionHandlers from "./events/connection.js";

export default function initSocket(server) {
    const io = new Server(server, {
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        registerConnectionHandlers(io, socket);
    });

    return io;
}
