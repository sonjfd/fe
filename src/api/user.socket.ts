// src/ws/user.ws.ts
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let userStompClient: Client | null = null;

export const connectUserWs = ({
  onNotification,
}: {
  onNotification: (noti: AdminNotification) => void; // hoặc kiểu riêng cho user
}) => {
  // Nếu đã có connection đang active thì không connect lại nữa
  if (userStompClient && userStompClient.active) {
    return;
  }

  const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);

  const client = new Client({
    webSocketFactory: () => socket as any,
    debug: () => {},
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  client.onConnect = () => {
    console.log("User WebSocket Connected");

    // DÙNG client.subscribe, không dùng userStompClient ở đây
    client.subscribe("/topic/orders", (message) => {
      try {
        const data = JSON.parse(message.body);
        onNotification?.(data);
      } catch (e) {
        console.error("WS parse error (/topic/orders):", e);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error(
      "STOMP error (user):",
      frame.headers["message"],
      frame.body
    );
  };

  client.onWebSocketError = (event) => {
    console.error("WebSocket error (user):", event);
  };

  // Gán vào biến global sau khi config xong
  userStompClient = client;
  client.activate();
};

export const disconnectUserWs = () => {
  if (userStompClient) {
    userStompClient.deactivate();
    userStompClient = null;
  }
};
