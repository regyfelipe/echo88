import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all"; // all, posts, users, hashtags

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        posts: [],
        users: [],
        hashtags: [],
      });
    }

    const supabase = createAdminClient();
    const searchTerm = `%${query.trim()}%`;
    const searchQuery = query.trim();

    interface SearchResult {
      posts: unknown[];
      users: unknown[];
      hashtags: unknown[];
    }
    const results: SearchResult = {
      posts: [],
      users: [],
      hashtags: [],
    };

    // Buscar posts
    if (type === "all" || type === "posts") {
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          id,
          user_id,
          content,
          type,
          media_url,
          media_thumbnail,
          gallery_items,
          document_url,
          document_name,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          users:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `
        )
        .ilike("content", searchTerm)
        .order("created_at", { ascending: false })
        .limit(20);

      interface PostRow {
        id: string;
        created_at: string;
        type: string;
        media_url?: string | null;
        media_thumbnail?: string | null;
        gallery_items?: unknown;
        content?: string | null;
        document_url?: string | null;
        document_name?: string | null;
        likes_count?: number;
        comments_count?: number;
        shares_count?: number;
        users?: {
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
        };
      }
      if (!postsError && posts) {
        results.posts = (posts as PostRow[]).map((post) => {
          const user = post.users;
          const timeAgo = getTimeAgo(post.created_at);

          let media = undefined;
          let gallery = undefined;

          if (
            post.type === "image" ||
            post.type === "video" ||
            post.type === "audio"
          ) {
            media = {
              url: post.media_url || "",
              thumbnail: post.media_thumbnail || undefined,
            };
          }

          if (post.type === "gallery" && post.gallery_items) {
            interface GalleryItem {
              url?: string;
              type?: string;
              thumbnail?: string;
            }
            gallery = Array.isArray(post.gallery_items)
              ? (post.gallery_items as GalleryItem[]).map((item) => ({
                  url: item.url || "",
                  type: item.type || "image",
                  thumbnail: item.thumbnail || undefined,
                }))
              : [];
          }

          return {
            id: post.id,
            author: {
              name: user?.full_name || "Usuário",
              username: user?.username || "usuario",
              avatar: user?.avatar_url || undefined,
            },
            content: post.content || undefined,
            type: post.type,
            media: media,
            gallery: gallery,
            document:
              post.type === "document"
                ? {
                    url: post.document_url || "",
                    name: post.document_name || "Documento",
                  }
                : undefined,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            timeAgo: timeAgo,
          };
        });
      }
    }

    // Buscar usuários (apenas quando type é "users", não em "all")
    if (type === "users") {
      // Buscar por username e full_name separadamente e combinar resultados
      const { data: usersByUsername, error: errorUsername } = await supabase
        .from("users")
        .select("id, full_name, username, avatar_url")
        .ilike("username", searchTerm)
        .limit(10);

      const { data: usersByName, error: errorName } = await supabase
        .from("users")
        .select("id, full_name, username, avatar_url")
        .ilike("full_name", searchTerm)
        .limit(10);

      if (errorUsername || errorName) {
        console.error("Error searching users:", errorUsername || errorName);
      }

      // Combinar resultados e remover duplicatas
      const allUsers = [...(usersByUsername || []), ...(usersByName || [])];
      const uniqueUsers = Array.from(
        new Map(allUsers.map((user) => [user.id, user])).values()
      );

      interface UserRow {
        id: string;
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
      }
      if (uniqueUsers.length > 0) {
        results.users = (uniqueUsers as UserRow[]).map((user) => ({
          id: user.id,
          name: user.full_name || "Usuário",
          username: user.username || "usuario",
          avatar: user.avatar_url || undefined,
        }));
      }
    }

    // Buscar hashtags
    if (type === "all" || type === "hashtags") {
      const hashtagName = query.trim().replace(/^#/, ""); // Remove # se houver
      const hashtagSearchTerm = `%${hashtagName}%`;
      const { data: hashtags, error: hashtagsError } = await supabase
        .from("hashtags")
        .select("id, name, posts_count")
        .ilike("name", hashtagSearchTerm)
        .order("posts_count", { ascending: false })
        .limit(10);

      interface HashtagRow {
        id: string;
        name: string;
        posts_count?: number;
      }
      if (!hashtagsError && hashtags) {
        results.hashtags = (hashtags as HashtagRow[]).map((hashtag) => ({
          id: hashtag.id,
          name: hashtag.name,
          postsCount: hashtag.posts_count || 0,
        }));
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in search route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

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
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}sem`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mes`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}ano${diffInYears > 1 ? "s" : ""}`;
}

