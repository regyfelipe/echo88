import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Buscar posts do usuário
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
        updated_at
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch user posts", details: error.message },
        { status: 500 }
      );
    }

    // Transformar os dados para o formato esperado
    interface PostRow {
      id: string;
      created_at: string;
      type: string;
      media_url?: string | null;
      media_thumbnail?: string | null;
      media_title?: string | null;
      media_artist?: string | null;
      gallery_items?: unknown;
      content?: string | null;
      document_url?: string | null;
      document_name?: string | null;
      likes_count?: number;
      comments_count?: number;
      shares_count?: number;
    }
    const formattedPosts =
      (posts as PostRow[] | null)?.map((post) => {
        const timeAgo = getTimeAgo(post.created_at);

        return {
          id: post.id,
          image: post.type === "image" ? post.media_url : undefined,
          content: post.content || undefined,
          type: post.type,
          media_url: post.media_url,
          media_thumbnail: post.media_thumbnail,
          media_title: post.media_title,
          media_artist: post.media_artist,
          gallery_items: post.gallery_items,
          document_url: post.document_url,
          document_name: post.document_name,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
          timeAgo: timeAgo,
        };
      }) || [];

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in user posts route:", error);
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

  if (diffInSeconds < 60) {
    return "agora";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}sem`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mes`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}ano${diffInYears > 1 ? "s" : ""}`;
}
