"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { VolumeX, ArrowLeft, Volume2 } from "lucide-react";

interface MutedUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  mutedAt: string;
}

export default function MutedUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unmuting, setUnmuting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMutedUsers();
    }
  }, [user]);

  const fetchMutedUsers = async () => {
    try {
      const response = await fetch("/api/users/muted");
      if (response.ok) {
        const data = await response.json();
        setMutedUsers(data.mutedUsers || []);
      }
    } catch (error) {
      console.error("Error fetching muted users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnmute = async (userId: string) => {
    setUnmuting(userId);
    try {
      const response = await fetch(`/api/users/mute?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMutedUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error("Error unmuting user:", error);
    } finally {
      setUnmuting(null);
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
          <h1 className="text-xl font-bold">Usuários Silenciados</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-2xl">
          {mutedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <VolumeX className="size-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Nenhum usuário silenciado
              </p>
              <p className="text-sm text-muted-foreground">
                Você não silenciou nenhum usuário ainda
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mutedUsers.map((mutedUser) => (
                <div
                  key={mutedUser.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                >
                  <Link
                    href={`/profile/${mutedUser.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {mutedUser.avatar ? (
                        <img
                          src={mutedUser.avatar}
                          alt={mutedUser.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-semibold">
                          {mutedUser.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{mutedUser.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        @{mutedUser.username}
                      </p>
                    </div>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnmute(mutedUser.id)}
                    disabled={unmuting === mutedUser.id}
                  >
                    <Volume2 className="size-4 mr-2" />
                    {unmuting === mutedUser.id ? "Ativando..." : "Ativar Som"}
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

