"use client";

import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

interface Conversation {
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchConversations() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/messages/conversations");
        if (!response.ok) throw new Error("Failed to fetch conversations");
        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [user]);

  function getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "agora";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}sem`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <h1 className="text-lg font-semibold">Mensagens</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando conversas...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma conversa ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.user.id}
                  href={`/messages/${conversation.user.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    {conversation.user.avatar ? (
                      <img
                        src={conversation.user.avatar}
                        alt={conversation.user.username}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold">
                        {conversation.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate">{conversation.user.username}</p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {getTimeAgo(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                      {conversation.unreadCount}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

