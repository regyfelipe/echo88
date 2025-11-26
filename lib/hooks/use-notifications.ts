"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "share" | "mention" | "reply";
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  message: string;
  timeAgo: string;
  isRead: boolean;
  postPreview?: {
    image?: string;
    content?: string;
  };
  postId?: string;
  commentId?: string;
}

interface UseNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
  realtime?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { limit = 50, unreadOnly = false, realtime = true } = options;
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (unreadOnly) params.append("unreadOnly", "true");

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load notifications.";
      console.error("Error fetching notifications:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit, unreadOnly]);

  // Buscar contagem de não lidas
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications/unread-count");
      if (!response.ok) throw new Error("Failed to fetch unread count");
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [user?.id]);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }, []);

  // Deletar notificação
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete notification");

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Atualizar contagem se necessário
        await fetchUnreadCount();
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [fetchUnreadCount]
  );

  // Carregar notificações iniciais
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Configurar Realtime subscription
  useEffect(() => {
    if (!user?.id || !realtime) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Nova notificação recebida
          fetchNotifications();
          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Notificação atualizada
          fetchNotifications();
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, realtime, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
    refetchUnreadCount: fetchUnreadCount,
  };
}
