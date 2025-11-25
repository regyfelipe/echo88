"use client";

import { BottomNavigation } from "@/components/bottom-navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FavouriteIcon,
  Message01Icon,
  UserAdd01Icon,
  Notification03Icon,
  Share07Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "share";
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
  multipleUsers?: number;
}

export default function NotificationsPage() {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "like",
      user: {
        name: "João Silva",
        username: "joaosilva",
      },
      message: "curtiu seu post",
      timeAgo: "5 min",
      isRead: false,
      postPreview: {
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
      },
    },
    {
      id: "2",
      type: "comment",
      user: {
        name: "Maria Santos",
        username: "mariasantos",
      },
      message: "comentou no seu post",
      timeAgo: "1h",
      isRead: false,
      postPreview: {
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=80",
        content: "Que foto incrível! 📸",
      },
    },
    {
      id: "3",
      type: "follow",
      user: {
        name: "Pedro Costa",
        username: "pedrocosta",
      },
      message: "começou a seguir você",
      timeAgo: "3h",
      isRead: true,
    },
    {
      id: "4",
      type: "like",
      user: {
        name: "Ana Oliveira",
        username: "anaoliveira",
      },
      message: "e mais 5 pessoas curtiram seu post",
      timeAgo: "1d",
      isRead: true,
      multipleUsers: 5,
      postPreview: {
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80",
      },
    },
    {
      id: "5",
      type: "share",
      user: {
        name: "Carlos Mendes",
        username: "carlosmendes",
      },
      message: "compartilhou seu post",
      timeAgo: "2d",
      isRead: true,
      postPreview: {
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
      },
    },
    {
      id: "6",
      type: "comment",
      user: {
        name: "Julia Ferreira",
        username: "juliaferreira",
      },
      message: "respondeu seu comentário",
      timeAgo: "3d",
      isRead: true,
      postPreview: {
        content: "Obrigada! 😊",
      },
    },
  ];

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return FavouriteIcon;
      case "comment":
        return Message01Icon;
      case "follow":
        return UserAdd01Icon;
      case "share":
        return Share07Icon;
      default:
        return Notification03Icon;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return "text-red-500 bg-red-500/10";
      case "comment":
        return "text-blue-500 bg-blue-500/10";
      case "follow":
        return "text-green-500 bg-green-500/10";
      case "share":
        return "text-purple-500 bg-purple-500/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 shadow-sm shadow-black/5 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-700 ease-out">
              Notificações
            </h1>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
            >
              Marcar todas como lidas
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-2 sm:px-4">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border/50">
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-accent/30 transition-all duration-300 ease-out cursor-pointer group animate-in fade-in slide-in-from-left-4",
                      !notification.isRead && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Avatar do usuário */}
                    <div className="relative shrink-0">
                      <div className="size-11 sm:size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden ring-2 ring-background transition-all duration-300 group-hover:ring-primary/30 group-hover:scale-105">
                        {notification.user.avatar ? (
                          <img
                            src={notification.user.avatar}
                            alt={notification.user.name}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-primary font-semibold text-sm sm:text-base">
                            {notification.user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Ícone do tipo de notificação */}
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-5 sm:size-6 rounded-full flex items-center justify-center ring-2 ring-background transition-all duration-300 group-hover:scale-110",
                          iconColor
                        )}
                      >
                        <HugeiconsIcon
                          icon={Icon}
                          className="size-3 sm:size-3.5"
                        />
                      </div>
                    </div>

                    {/* Conteúdo da notificação */}
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className="text-sm sm:text-base font-semibold text-foreground">
                            {notification.user.name}
                            {notification.multipleUsers && (
                              <span className="text-muted-foreground font-normal">
                                {" "}
                                e mais {notification.multipleUsers}
                              </span>
                            )}
                          </p>
                          <p className="text-sm sm:text-base text-foreground/80">
                            {notification.message}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                          {notification.timeAgo}
                        </p>
                      </div>

                      {/* Preview do post */}
                      {notification.postPreview && (
                        <div className="shrink-0">
                          {notification.postPreview.image ? (
                            <div className="size-14 sm:size-16 rounded-lg overflow-hidden bg-muted border border-border/50 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30">
                              <img
                                src={notification.postPreview.image}
                                alt="Post preview"
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="size-14 sm:size-16 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center p-2">
                              <p className="text-xs text-muted-foreground line-clamp-3 text-center">
                                {notification.postPreview.content}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Indicador de não lida */}
                    {!notification.isRead && (
                      <div className="shrink-0 size-2 sm:size-2.5 rounded-full bg-primary mt-2 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="size-16 sm:size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
                <HugeiconsIcon
                  icon={Notification03Icon}
                  className="size-8 sm:size-10 text-muted-foreground/50"
                />
              </div>
              <p className="text-foreground/80 text-base sm:text-lg font-medium mb-1.5">
                Nenhuma notificação
              </p>
              <p className="text-muted-foreground/70 text-sm sm:text-base">
                Você está em dia! 🎉
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
