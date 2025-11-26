"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

interface Follower {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  followedAt: string;
}

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowers() {
      try {
        setIsLoading(true);

        // Primeiro, buscar userId pelo username
        const userResponse = await fetch(`/api/users/username/${username}`);
        if (!userResponse.ok) {
          throw new Error("User not found");
        }
        const userData = await userResponse.json();
        const userId = userData.user.id;

        // Agora buscar seguidores
        const response = await fetch(`/api/users/${userId}/followers`);
        if (!response.ok) throw new Error("Failed to fetch followers");
        const data = await response.json();

        // Formatar dados dos seguidores
        interface FollowerItem {
          follower?: {
            id?: string;
            full_name?: string | null;
            username?: string | null;
            avatar_url?: string | null;
          };
          follower_id?: string;
          created_at?: string;
        }
        const formattedFollowers = (
          (data.followers as FollowerItem[] | null) || []
        )
          .map((item) => {
            const follower = item.follower || {};
            return {
              id: follower.id || item.follower_id || "",
              name: follower.full_name || "Usuário",
              username: follower.username || "usuario",
              avatar: follower.avatar_url || undefined,
              followedAt: item.created_at || new Date().toISOString(),
            };
          })
          .filter((f) => f.id !== "") as Follower[];

        setFollowers(formattedFollowers);
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      fetchFollowers();
    }
  }, [username]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">Seguidores</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum seguidor ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {followers.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/profile/${follower.username}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                    {follower.avatar ? (
                      <img
                        src={follower.avatar}
                        alt={follower.username}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold">
                        {follower.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{follower.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {follower.name}
                    </p>
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
