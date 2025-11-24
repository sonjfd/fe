import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";



let stompClient: Client | null = null;

export const connectAdminWs = (
    onNotification: (noti: AdminNotification) => void
) => {
    const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);

    stompClient = new Client({
        webSocketFactory: () => socket as any,
        debug: () => { },
        reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
        console.log("Admin WebSocket Connected");

        stompClient?.subscribe("/topic/admin/orders", (message) => {
            onNotification(JSON.parse(message.body));
        });
    };

    stompClient.activate();
};

export const disconnectAdminWs = () => {
    stompClient?.deactivate();
};
