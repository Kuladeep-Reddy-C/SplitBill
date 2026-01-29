import { feastRoom } from "../rooms.js";

export default function registerFeastEvents(io, socket) {

    // ITEM ADDED → user becomes feast member
    socket.on("feast:item:add", ({ feastId, user, item }) => {
        io.to(feastRoom(feastId)).emit("feast:item:added", {
            user,
            item,
            time: Date.now(),
        });
    });

    // QUANTITY UPDATED
    socket.on("feast:item:update", ({ feastId, user, item }) => {
        io.to(feastRoom(feastId)).emit("feast:item:updated", {
            user,
            item,
            time: Date.now(),
        });
    });

    // USER SAYS "I PAY"
    socket.on("feast:payer:add", ({ feastId, user, amount }) => {
        io.to(feastRoom(feastId)).emit("feast:payer:added", {
            user,
            amount,
            time: Date.now(),
        });
    });

}
