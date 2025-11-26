import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const supabase = createAdminClient();

    // Posts trending: alta atividade nas últimas 24 horas
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        content,
        type,
        media_url,
        media_thumbnail,
        media_title,
        media_artist,
        gallery_items,
        document_url,
        document_name,
        likes_count,
        comments_count,
        shares_count,
        views_count,
        created_at,
        users:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .gte("created_at", oneDayAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit * 2);

    if (error) {
      console.error("Error fetching trending posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch trending posts", details: error.message },
        { status: 500 }
      );
    }

    // Calcular score de trending (mais peso para atividade recente)
    interface PostWithTrendingScore {
      created_at: string;
      likes_count?: number;
      comments_count?: number;
      shares_count?: number;
      views_count?: number;
      id: string;
      type: string;
      media_url?: string | null;
      media_thumbnail?: string | null;
      media_title?: string | null;
      media_artist?: string | null;
      gallery_items?: unknown;
      content?: string | null;
      document_url?: string | null;
      document_name?: string | null;
      users?: {
        full_name?: string | null;
        username?: string | null;
        avatar_url?: string | null;
      };
      trendingScore?: number;
    }
    const postsWithScore = (posts as PostWithTrendingScore[] || []).map((post) => {
      const hoursSinceCreation =
        (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      const recencyFactor = Math.max(0, 1 - hoursSinceCreation / 24); // Decai ao longo de 24h

      const engagementScore =
        ((post.likes_count || 0) * 2 +
          (post.comments_count || 0) * 3 +
          (post.shares_count || 0) * 2 +
          (post.views_count || 0) * 0.1) *
        (1 + recencyFactor); // Multiplica por fator de recência

      return {
        ...post,
        trendingScore: engagementScore,
      };
    });

    // Ordenar por score de trending
    const trendingPosts = postsWithScore
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    // Formatar posts
    const formattedPosts = trendingPosts.map((post) => {
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
          title: post.media_title || undefined,
          artist: post.media_artist || undefined,
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

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in trending posts route:", error);
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

