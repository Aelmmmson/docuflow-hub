// backend/websocket.js
const { WebSocketServer, WebSocket } = require("ws");

let wss = null;
const clients = new Map(); // ws -> { userId, role }

function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: "/ws/notifications" });

  console.log("[WEBSOCKET] Notification WebSocket server initialized on path /ws/notifications");

  wss.on("connection", (ws, req) => {
    console.log("[WEBSOCKET] New client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "REGISTER") {
          clients.set(ws, {
            userId: data.userId ? String(data.userId) : null,
            role: data.role ? String(data.role).toLowerCase() : null,
          });
          console.log(`[WEBSOCKET] Registered client user=${data.userId}, role=${data.role}`);
          ws.send(
            JSON.stringify({
              type: "REGISTERED",
              message: "Connected to DocuFlow Real-time Notifications",
            })
          );
        }
      } catch (err) {
        console.warn("[WEBSOCKET] Invalid message format:", err.message);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("[WEBSOCKET] Client disconnected");
    });

    ws.on("error", (err) => {
      console.error("[WEBSOCKET] Socket error:", err.message);
    });
  });
}

function broadcastNotification(payload) {
  if (!wss) return;

  const msgStr = JSON.stringify({
    type: "NOTIFICATION",
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: payload.title || "Document Update",
    message: payload.message || "",
    docId: payload.docId || "",
    action: payload.action || "UPDATE",
    targetUserId: payload.targetUserId || null,
    targetRole: payload.targetRole || null,
    timestamp: payload.timestamp || new Date().toISOString(),
    read: false,
  });

  clients.forEach((clientInfo, clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      // Filter target if specific userId or role specified
      if (payload.targetUserId && String(payload.targetUserId) !== String(clientInfo.userId)) {
        return;
      }
      if (payload.targetRole && payload.targetRole.toLowerCase() !== (clientInfo.role || "").toLowerCase()) {
        return;
      }
      clientWs.send(msgStr);
    }
  });
}

module.exports = {
  initWebSocketServer,
  broadcastNotification,
};
