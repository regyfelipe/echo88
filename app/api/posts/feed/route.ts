import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { withRateLimit, getUserIdFromRequest } from "@/lib/rate-limit/rate-limit-decorator";

// Handler original
async function feedHandler(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const session = await getSession();

    // Buscar posts
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const feedType = searchParams.get("type") || "chronological"; // chronological, relevance, personalized

    let postsQuery = supabase.from("posts").select("*");

    // Aplicar algoritmo de feed baseado no tipo
    if (feedType === "chronological") {
      // Feed cronológico - ordenar por data de criação
      postsQuery = postsQuery.order("created_at", { ascending: false });
    } else if (feedType === "relevance") {
      // Feed por relevância - ordenar por likes primeiro (depois ordenaremos por score completo)
      postsQuery = postsQuery.order("likes_count", { ascending: false });
    } else if (feedType === "personalized") {
      // Feed personalizado - posts de usuários seguidos primeiro, depois por relevância
      if (session?.userId) {
        // Buscar usuários seguidos
        const { data: following } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", session.userId);

        const followingIds = following?.map((f) => f.following_id) || [];

        if (followingIds.length > 0) {
          // Posts de usuários seguidos primeiro
          postsQuery = postsQuery
            .in("user_id", followingIds)
            .order("created_at", { ascending: false });
        } else {
          // Se não seguir ninguém, usar relevância
          postsQuery = postsQuery.order("created_at", { ascending: false });
        }
      } else {
        // Se não estiver logado, usar cronológico
        postsQuery = postsQuery.order("created_at", { ascending: false });
      }
    }

    const { data: posts, error: postsError } = await postsQuery
      .range(offset, offset + limit - 1)
      .limit(limit);

    // Se for relevância, ordenar manualmente por score completo
    interface PostWithCounts {
      likes_count?: number;
      comments_count?: number;
      shares_count?: number;
      views_count?: number;
    }
    if (feedType === "relevance" && posts) {
      posts.sort((a: PostWithCounts, b: PostWithCounts) => {
        const scoreA = (a.likes_count || 0) + (a.comments_count || 0) + (a.shares_count || 0) + (a.views_count || 0);
        const scoreB = (b.likes_count || 0) + (b.comments_count || 0) + (b.shares_count || 0) + (b.views_count || 0);
        return scoreB - scoreA;
      });
    }

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch posts", details: postsError.message },
        { status: 500 }
      );
    }

    // Buscar dados dos usuários
    interface PostRow {
      user_id: string;
      id: string;
    }
    const userIds = [...new Set((posts as PostRow[] | null)?.map((p) => p.user_id) || [])];
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, username, avatar_url")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch users", details: usersError.message },
        { status: 500 }
      );
    }

    // Criar mapa de usuários
    interface UserRow {
      id: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    }
    const usersMap = new Map<string, UserRow>((users as UserRow[] | null)?.map((u) => [u.id, u]) || []);

    // Buscar likes, saves e favorites do usuário logado (se houver sessão)
    const userLikes = new Set<string>();
    const userSaves = new Set<string>();
    const userFavorites = new Set<string>();

    if (session?.userId && posts && posts.length > 0) {
      const postIds = (posts as PostRow[]).map((p) => p.id);

      const [likesResult, savesResult, favoritesResult] = await Promise.all([
        supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", session.userId)
          .in("post_id", postIds),
        supabase
          .from("post_saves")
          .select("post_id")
          .eq("user_id", session.userId)
          .in("post_id", postIds),
        supabase
          .from("post_favorites")
          .select("post_id")
          .eq("user_id", session.userId)
          .in("post_id", postIds),
      ]);

      interface LikeSaveFavorite {
        post_id: string;
      }
      likesResult.data?.forEach((like: LikeSaveFavorite) => userLikes.add(like.post_id));
      savesResult.data?.forEach((save: LikeSaveFavorite) => userSaves.add(save.post_id));
      favoritesResult.data?.forEach((fav: LikeSaveFavorite) =>
        userFavorites.add(fav.post_id)
      );
    }

    // Transformar os dados para o formato esperado pelo PostCard
    interface FullPostRow extends PostRow {
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
      document_size?: number | null;
      likes_count?: number;
      comments_count?: number;
      shares_count?: number;
      views_count?: number;
    }
    const formattedPosts =
      (posts as FullPostRow[] | null)?.map((post) => {
        const user = usersMap.get(post.user_id);
        const timeAgo = getTimeAgo(post.created_at);

        // Formatar mídia baseado no tipo
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
          isLiked: userLikes.has(post.id),
          isSaved: userSaves.has(post.id),
          isFavorited: userFavorites.has(post.id),
        };
      }) || [];

    // Verificar se há mais posts
    const hasMore = formattedPosts.length === limit;
    
    return NextResponse.json({ 
      posts: formattedPosts,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in feed route:", error);
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

// Export com rate limiting
export const GET = withRateLimit(feedHandler, {
  type: "feed",
  getUserId: getUserIdFromRequest,
});
