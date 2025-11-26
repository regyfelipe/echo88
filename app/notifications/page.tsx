"use client";

import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
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
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications";
import Image from "next/image";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
  } = useNotifications({ limit: 100 });

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

  const handleNotificationClick = (notification: Notification) => {
    // Navegar para o post ou perfil
    if (notification.postId) {
      router.push(`/post/${notification.postId}`);
    } else if (notification.type === "follow") {
      router.push(`/profile/${notification.user.username}`);
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
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
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
                    onClick={() => handleNotificationClick(notification)}
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
                          <Image
                            src={notification.user.avatar}
                            alt={notification.user.name}
                            width={48}
                            height={48}
                            className="size-full object-cover"
                            unoptimized
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
                              <Image
                                src={notification.postPreview.image}
                                alt="Post preview"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                unoptimized
                                onError={(e) => {
                                  // Se a imagem falhar, esconder o preview
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.display = "none";
                                  }
                                }}
                              />
                            </div>
                          ) : notification.postPreview.content ? (
                            <div className="size-14 sm:size-16 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center p-2">
                              <p className="text-xs text-muted-foreground line-clamp-3 text-center">
                                {notification.postPreview.content}
                              </p>
                            </div>
                          ) : null}
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
