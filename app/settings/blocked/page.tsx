"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { UserX, ArrowLeft, Unlock } from "lucide-react";

interface BlockedUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  blockedAt: string;
}

export default function BlockedUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBlockedUsers();
    }
  }, [user]);

  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch("/api/users/blocked");
      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    setUnblocking(userId);
    try {
      const response = await fetch(`/api/users/block?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    } finally {
      setUnblocking(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-bold">Usuários Bloqueados</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-2xl">
          {blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserX className="size-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Nenhum usuário bloqueado
              </p>
              <p className="text-sm text-muted-foreground">
                Você não bloqueou nenhum usuário ainda
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                >
                  <Link
                    href={`/profile/${blockedUser.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {blockedUser.avatar ? (
                        <img
                          src={blockedUser.avatar}
                          alt={blockedUser.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-semibold">
                          {blockedUser.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{blockedUser.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        @{blockedUser.username}
                      </p>
                    </div>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(blockedUser.id)}
                    disabled={unblocking === blockedUser.id}
                  >
                    <Unlock className="size-4 mr-2" />
                    {unblocking === blockedUser.id ? "Desbloqueando..." : "Desbloquear"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

