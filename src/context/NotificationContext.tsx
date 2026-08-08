// src/context/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  docId?: string;
  action?: "SUBMITTED" | "APPROVED" | "REJECTED" | "UPDATE";
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markDocAsRead: (docId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  refreshPendingNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentUser = getCurrentUser();
  const userIdKey = currentUser?.user_id ? String(currentUser.user_id) : "guest";
  const LOCAL_STORAGE_KEY = `xdms_notifications_${userIdKey}`;

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-load notifications whenever user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      setNotifications(saved ? JSON.parse(saved) : []);
    } catch {
      setNotifications([]);
    }
  }, [userIdKey, LOCAL_STORAGE_KEY]);

  // Save user-isolated notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Could not save notifications to localStorage:", e);
    }
  }, [notifications, LOCAL_STORAGE_KEY]);

  // Sync pending documents from backend as notifications for current user
  const refreshPendingNotifications = useCallback(async () => {
    if (!currentUser?.user_id || !currentUser?.role_name) return;

    try {
      const roleLower = String(currentUser.role_name).toLowerCase();
      let endpoint = `/get-pending-docs/${currentUser.user_id}/${encodeURIComponent(roleLower)}`;
      if (roleLower === "originator" || roleLower === "admin") {
        endpoint = `/get-generated-docs/${currentUser.user_id}/${encodeURIComponent(roleLower)}`;
      }

      const res = await api.get<{ result: any[] }>(endpoint);
      const pendingDocs = Array.isArray(res.data?.result) ? res.data.result : [];

      setNotifications((prev) => {
        const nextList = [...prev];
        pendingDocs.forEach((doc: any) => {
          const docIdStr = doc.doc_id || String(doc.id);
          const existingIdx = nextList.findIndex(
            (n) => n.docId === docIdStr || n.id === `notif_pending_${docIdStr}`
          );

          if (existingIdx === -1) {
            nextList.unshift({
              id: `notif_pending_${docIdStr}`,
              title: `Pending Review: ${doc.doctype_name || "Document"}`,
              message: `Document ${docIdStr} (${doc.doctype_name || "Request"}) requires your stage ${doc.approval_stage || 1} review.`,
              docId: docIdStr,
              action: "SUBMITTED",
              timestamp: doc.created_at || new Date().toISOString(),
              read: false,
            });
          }
        });
        return nextList;
      });
    } catch (err) {
      // Quiet fail if network unready
    }
  }, [currentUser?.user_id, currentUser?.role_name]);

  useEffect(() => {
    refreshPendingNotifications();
  }, [refreshPendingNotifications]);

  // Establish WebSocket Connection
  useEffect(() => {
    if (!currentUser?.user_id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/notifications`;

    let socket: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isComponentMounted = true;

    const connect = () => {
      if (!isComponentMounted) return;

      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          if (currentUser) {
            socket?.send(
              JSON.stringify({
                type: "REGISTER",
                userId: currentUser.user_id,
                role: currentUser.role_name,
              })
            );
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "NOTIFICATION") {
              const newNotif: AppNotification = {
                id: data.id || `notif_${Date.now()}`,
                title: data.title || "Notification",
                message: data.message || "",
                docId: data.docId,
                action: data.action,
                timestamp: data.timestamp || new Date().toISOString(),
                read: false,
              };

              setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        socket.onerror = () => {
          // Quiet
        };

        socket.onclose = () => {
          if (isComponentMounted) {
            reconnectTimer = setTimeout(connect, 10000);
          }
        };
      } catch (err) {
        if (isComponentMounted) {
          reconnectTimer = setTimeout(connect, 10000);
        }
      }
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    };
  }, [currentUser?.user_id, currentUser?.role_name]);

  const unreadCount = notifications.length;

  // When a notification is clicked or read, remove it from the dropdown list for that user
  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markDocAsRead = (docId: string) => {
    if (!docId) return;
    setNotifications((prev) => prev.filter((n) => n.docId !== docId));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markDocAsRead,
        markAllAsRead,
        clearNotifications,
        refreshPendingNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
