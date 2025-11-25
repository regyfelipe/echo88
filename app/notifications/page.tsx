import { BottomNavigation } from "@/components/bottom-navigation";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      type: "like",
      icon: Heart,
      message: "João Silva curtiu seu post",
      timeAgo: "5 min",
    },
    {
      type: "comment",
      icon: MessageCircle,
      message: "Maria Santos comentou no seu post",
      timeAgo: "1h",
    },
    {
      type: "follow",
      icon: UserPlus,
      message: "Pedro Costa começou a seguir você",
      timeAgo: "3h",
    },
    {
      type: "like",
      icon: Heart,
      message: "Ana Oliveira e mais 5 pessoas curtiram seu post",
      timeAgo: "1d",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <h1 className="text-xl font-bold">Notificações</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification, index) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timeAgo}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
