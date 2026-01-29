import { groupRoom, feastRoom } from "../rooms.js";

export default function registerChatEvents(io, socket) {

    socket.on("group:join", ({ groupId, user }) => {
        socket.join(groupRoom(groupId));

        io.to(groupRoom(groupId)).emit("chat:system", {
            type: "join",
            user,
            time: Date.now(),
            message: `${user.name} joined the group`,
        });
    });

    socket.on("feast:join", ({ feastId, user }) => {
        socket.join(feastRoom(feastId));

        io.to(feastRoom(feastId)).emit("chat:system", {
            type: "join",
            user,
            time: Date.now(),
            message: `${user.name} joined the feast`,
        });
    });

    socket.on("chat:message", ({ scope, id, user, text }) => {
        const payload = {
            id: crypto.randomUUID(),
            user,
            text,
            time: Date.now(),
        };

        if (scope === "group") {
            io.to(groupRoom(id)).emit("chat:message", payload);
        }

        if (scope === "feast") {
            io.to(feastRoom(id)).emit("chat:message", payload);
        }
    });
}
