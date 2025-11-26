/**
 * Utilitários para criação de notificações
 */

/**
 * Cria uma notificação no sistema
 */
export async function createNotification(data: {
  userId: string;
  type: "like" | "comment" | "follow" | "share" | "mention" | "reply";
  actorId: string;
  postId?: string;
  commentId?: string;
  message?: string;
}): Promise<void> {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

