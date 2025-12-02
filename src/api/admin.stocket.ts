// src/ws/admin.ws.ts (hoặc src/api/admin.socket.ts)
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let adminStompClient: Client | null = null;

export const connectAdminWs = ({
  onNotification,
}: {
  onNotification: (noti: AdminNotification) => void;
}) => {
  if (adminStompClient && adminStompClient.active) return;

  // const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}ws`);
  const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);
  //local chay dong 15 deploy chay dong 14

  const client = new Client({
    webSocketFactory: () => socket as any,
    debug: () => { },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  client.onConnect = () => {
    console.log("Admin WebSocket Connected");

    client.subscribe("/topic/admin/orders", (message) => {
      try {
        const data = JSON.parse(message.body);
        onNotification?.(data);
      } catch (e) {
        console.error("WS parse error (/topic/admin/orders):", e);
      }
    });

    client.subscribe("/topic/admin/contacts", (message) => {
      try {
        const data = JSON.parse(message.body);
        onNotification?.(data);
      } catch (e) {
        console.error("WS parse error (/topic/admin/contacts):", e);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error("STOMP error (admin):", frame.headers["message"], frame.body);
  };

  client.onWebSocketError = (event) => {
    console.error("WebSocket error (admin):", event);
  };

  adminStompClient = client;
  client.activate();
};

export const disconnectAdminWs = () => {
  if (adminStompClient) {
    adminStompClient.deactivate();
    adminStompClient = null;
  }
};
