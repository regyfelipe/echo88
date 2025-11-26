"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

interface Following {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  followedAt: string;
}

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [following, setFollowing] = useState<Following[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowing() {
      try {
        setIsLoading(true);

        // Primeiro, buscar userId pelo username
        const userResponse = await fetch(`/api/users/username/${username}`);
        if (!userResponse.ok) {
          throw new Error("User not found");
        }
        const userData = await userResponse.json();
        const userId = userData.user.id;

        // Agora buscar seguindo
        const response = await fetch(`/api/users/${userId}/following`);
        if (!response.ok) throw new Error("Failed to fetch following");
        const data = await response.json();

        // Formatar dados dos seguindo
        interface FollowingItem {
          following?: {
            id?: string;
            full_name?: string | null;
            username?: string | null;
            avatar_url?: string | null;
          };
          following_id?: string;
          created_at?: string;
        }
        interface Following {
          id: string;
          name: string;
          username: string;
          avatar?: string;
          followedAt: string;
        }
        const formattedFollowing = (
          (data.following as FollowingItem[] | null) || []
        )
          .map((item) => {
            const following = item.following || {};
            return {
              id: following.id || item.following_id || "",
              name: following.full_name || "Usuário",
              username: following.username || "usuario",
              avatar: following.avatar_url || undefined,
              followedAt: item.created_at || new Date().toISOString(),
            };
          })
          .filter((f) => f.id !== "") as Following[];

        setFollowing(formattedFollowing);
      } catch (error) {
        console.error("Error fetching following:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      fetchFollowing();
    }
  }, [username]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">Seguindo</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Não está seguindo ninguém ainda
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {following.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
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
