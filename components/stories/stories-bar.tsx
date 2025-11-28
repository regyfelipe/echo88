"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { OptimizedImage } from "@/components/shared/optimized-image";

interface Story {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  media_thumbnail?: string;
  content?: string;
  expires_at: string;
  views_count: number;
  created_at: string;
  has_viewed: boolean;
}

interface StoryGroup {
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  stories: Story[];
}

export function StoriesBar() {
  const { user } = useAuth();
  const router = useRouter();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/stories");
        if (response.ok) {
          const data = await response.json();
          setStoryGroups(data.stories || []);
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStories();
  }, []);

  const handleStoryClick = (storyGroup: StoryGroup) => {
    router.push(`/stories/${storyGroup.user.id}`);
  };

  const handleCreateStory = () => {
    router.push("/stories/create");
  };

  if (isLoading) {
    return (
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-2 sm:px-4">
          <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">
            <div className="size-16 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="size-16 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="size-16 rounded-full bg-muted animate-pulse shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  if (storyGroups.length === 0 && !user) {
    return null;
  }

  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl px-2 sm:px-4">
        <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">
          {/* Botão criar story (apenas se autenticado) */}
          {user && (
            <button
              onClick={handleCreateStory}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="relative size-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-0.5 group-hover:scale-105 transition-transform">
                <div className="size-full rounded-full overflow-hidden bg-background flex items-center justify-center">
                  {user.avatar ? (
                    <OptimizedImage
                      src={user.avatar}
                      alt={user.fullName}
                      width={64}
                      height={64}
                      className="rounded-full object-cover opacity-50"
                      quality={70}
                    />
                  ) : (
                    <span className="text-foreground/30 font-light text-2xl">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={Add01Icon}
                      className="size-6 text-primary"
                    />
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-foreground/70 font-medium">
                Criar
              </span>
            </button>
          )}

          {/* Stories dos usuários */}
          {storyGroups.map((group) => {
            const firstStory = group.stories[0];
            const hasUnviewed = group.stories.some((s) => !s.has_viewed);
            const isVideo = firstStory.media_type === "video";

            return (
              <button
                key={group.user.id}
                onClick={() => handleStoryClick(group)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div
                  className={cn(
                    "relative size-16 rounded-full p-0.5 group-hover:scale-105 transition-transform",
                    hasUnviewed
                      ? "bg-gradient-to-br from-primary via-primary/80 to-primary/60"
                      : "bg-gradient-to-br from-muted/50 to-muted/30"
                  )}
                >
                  <div className="size-full rounded-full overflow-hidden bg-background">
                    {group.user.avatar ? (
                      <OptimizedImage
                        src={group.user.avatar}
                        alt={group.user.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                        quality={80}
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-primary/10">
                        <span className="text-primary font-semibold text-lg">
                          {group.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={PlayIcon}
                        className="size-4 text-white drop-shadow-lg"
                      />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-foreground/70 font-medium max-w-[64px] truncate">
                  {group.user.username}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
