import { io } from "socket.io-client";

let socket;

export const initSocket = (backendUrl) => {
    if (!socket) {
        socket = io(backendUrl, { transports: ["websocket"] });

        socket.on("connect", () => {
            console.log("Socket connected, id:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) throw new Error("Socket not initialized. Call initSocket first.");
    return socket;
};