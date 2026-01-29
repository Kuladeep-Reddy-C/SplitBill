import registerChatEvents from "./chat.events.js";
import registerFeastEvents from "./feast.events.js";

export default function registerConnectionHandlers(io, socket) {
    console.log("🔌 Connected:", socket.id);

    registerChatEvents(io, socket);
    registerFeastEvents(io, socket);

    socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
    });
}
