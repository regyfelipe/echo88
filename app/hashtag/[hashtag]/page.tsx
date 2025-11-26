"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { PostCard } from "@/components/posts/post-card";
import { InlineAd } from "@/components/shared/google-ad";

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content?: string;
  type: "text" | "image" | "video" | "audio" | "gallery" | "document";
  media?: {
    url: string;
    thumbnail?: string;
    title?: string;
    artist?: string;
  };
  gallery?: Array<{
    url: string;
    type: "image" | "video";
    thumbnail?: string;
  }>;
  document?: {
    url: string;
    name: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export default function HashtagPage() {
  const params = useParams();
  const hashtag = params.hashtag as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagData, setHashtagData] = useState<{
    id: string;
    name: string;
    postsCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHashtagPosts() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/hashtags/${encodeURIComponent(hashtag)}`);
        if (!response.ok) throw new Error("Failed to fetch hashtag posts");
        const data = await response.json();
        setHashtagData(data.hashtag);
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching hashtag posts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHashtagPosts();
  }, [hashtag]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <h1 className="text-lg font-semibold">#{hashtagData?.name || hashtag}</h1>
          {hashtagData && (
            <p className="text-sm text-muted-foreground">
              {hashtagData.postsCount} {hashtagData.postsCount === 1 ? "post" : "posts"}
            </p>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-2 sm:px-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum post com esta hashtag</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div key={post.id || index}>
                <div
                  className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out mb-4"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <PostCard {...post} />
                </div>
                {(index + 1) % 3 === 0 && index < posts.length - 1 && (
                  <InlineAd />
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

