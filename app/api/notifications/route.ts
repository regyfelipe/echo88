import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { getTimeAgo } from "@/lib/utils/date";

// GET - Buscar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Buscar notificações
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications", details: error.message },
        { status: 500 }
      );
    }

    // Buscar dados relacionados (atores e posts) em paralelo
    interface NotificationRow {
      actor_id: string;
      post_id: string | null;
    }
    const actorIds = [
      ...new Set(
        (notifications as NotificationRow[] | null)
          ?.map((n) => n.actor_id)
          .filter(Boolean) || []
      ),
    ];
    const postIds = [
      ...new Set(
        (notifications as NotificationRow[] | null)
          ?.map((n) => n.post_id)
          .filter(Boolean) || []
      ),
    ];

    // Buscar atores
    const { data: actors } = await supabase
      .from("users")
      .select("id, full_name, username, avatar_url")
      .in("id", actorIds);

    // Buscar posts
    const postsResult =
      postIds.length > 0
        ? await supabase
            .from("posts")
            .select(
              "id, type, media_url, media_thumbnail, content, gallery_items"
            )
            .in("id", postIds)
        : { data: [] };
    const posts = postsResult.data || [];

    // Criar mapas para acesso rápido
    interface Actor {
      id: string;
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    }
    interface Post {
      id: string;
      type: string;
      media_url: string | null;
      media_thumbnail: string | null;
      content: string | null;
      gallery_items: unknown;
    }
    const actorsMap = new Map<string, Actor>(
      (actors as Actor[] | null)?.map((a) => [a.id, a]) || []
    );
    const postsMap = new Map<string, Post>(
      (posts as Post[] | null)?.map((p) => [p.id, p]) || []
    );

    // Formatar notificações
    interface NotificationRow {
      id: string;
      type: string;
      actor_id: string;
      post_id: string | null;
      comment_id: string | null;
      message: string | null;
      is_read: boolean;
      created_at: string;
    }
    const formattedNotifications =
      (notifications as NotificationRow[] | null)?.map((notification) => {
        const actor = actorsMap.get(notification.actor_id) || {};
        const post = notification.post_id
          ? postsMap.get(notification.post_id) || null
          : null;

        // Gerar mensagem baseada no tipo
        let message = "";
        switch (notification.type) {
          case "like":
            message = "curtiu seu post";
            break;
          case "comment":
            message = "comentou no seu post";
            break;
          case "follow":
            message = "começou a seguir você";
            break;
          case "share":
            message = "compartilhou seu post";
            break;
          case "mention":
            message = "mencionou você";
            break;
          case "reply":
            message = "respondeu seu comentário";
            break;
          default:
            message = notification.message || "";
        }

        // Preparar preview do post
        interface PostPreview {
          image?: string;
          content?: string;
        }
        let postPreview: PostPreview | undefined = undefined;
        if (post && post.id) {
          try {
            // Se for imagem ou vídeo
            if (
              (post.type === "image" || post.type === "video") &&
              post.media_url
            ) {
              postPreview = {
                image: post.media_thumbnail || post.media_url,
              };
            }
            // Se for galeria
            else if (post.type === "gallery" && post.gallery_items) {
              let galleryItems = post.gallery_items;
              // Se for string JSON, fazer parse
              if (typeof galleryItems === "string") {
                try {
                  galleryItems = JSON.parse(galleryItems);
                } catch (e) {
                  console.error("Error parsing gallery_items:", e);
                  galleryItems = [];
                }
              }

              if (Array.isArray(galleryItems) && galleryItems.length > 0) {
                const firstItem = galleryItems[0];
                postPreview = {
                  image:
                    firstItem?.thumbnail ||
                    firstItem?.url ||
                    firstItem?.media_url,
                };
              }
            }
            // Se tiver conteúdo de texto
            else if (post.content && post.content.trim()) {
              postPreview = {
                content:
                  post.content.length > 100
                    ? post.content.substring(0, 100) + "..."
                    : post.content,
              };
            }
          } catch (error) {
            console.error("Error processing post preview:", error);
            // Se houver erro, não mostrar preview
            postPreview = undefined;
          }
        }

        return {
          id: notification.id,
          type: notification.type,
          user: {
            name: (actor as Actor)?.full_name || "Usuário",
            username: (actor as Actor)?.username || "usuario",
            avatar: (actor as Actor)?.avatar_url || undefined,
          },
          message,
          timeAgo: getTimeAgo(notification.created_at),
          isRead: notification.is_read,
          postPreview,
          postId: notification.post_id,
          commentId: notification.comment_id,
        };
      }) || [];

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notifications route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Criar notificação (usado internamente pelo sistema)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const { userId, type, actorId, postId, commentId, message } = body;

    if (!userId || !type || !actorId) {
      return NextResponse.json(
        { error: "userId, type, and actorId are required" },
        { status: 400 }
      );
    }

    // Não criar notificação se o usuário está notificando a si mesmo
    if (userId === actorId) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Verificar se já existe uma notificação similar recente (evitar spam)
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("actor_id", actorId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Se já existe uma notificação não lida do mesmo tipo e ator nos últimos 5 minutos, não criar nova
    if (existing) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        actor_id: actorId,
        post_id: postId || null,
        comment_id: commentId || null,
        message: message || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ notification: data });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification", details: errorMessage },
      { status: 500 }
    );
  }
}
