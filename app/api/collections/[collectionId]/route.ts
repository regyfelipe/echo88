import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// GET - Buscar coleção específica com posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await getSession();
    const supabase = createAdminClient();
    const { collectionId } = await params;

    // Buscar coleção
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (collectionError) throw collectionError;

    // Verificar se é pública ou do usuário
    if (!collection.is_public && collection.user_id !== session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Buscar posts da coleção
    const { data: collectionPosts, error: postsError } = await supabase
      .from("collection_posts")
      .select(
        `
        *,
        posts (
          id,
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
          user_id,
          users!posts_user_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `
      )
      .eq("collection_id", collectionId)
      .order("position", { ascending: true })
      .order("added_at", { ascending: false });

    if (postsError) throw postsError;

    // Formatar posts
    interface CollectionPostRow {
      posts: {
        id: string;
        content?: string | null;
        type: string;
        media_url?: string | null;
        media_thumbnail?: string | null;
        gallery_items?: unknown;
        document_url?: string | null;
        document_name?: string | null;
        likes_count?: number;
        comments_count?: number;
        shares_count?: number;
        created_at: string;
        users?: {
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
        };
      } | null;
    }
    const posts = ((collectionPosts as CollectionPostRow[] | null) || [])
      .map((cp) => {
        const post = cp.posts;
        if (!post) return null;

        const user = post.users;
        return {
          id: post.id,
          author: {
            name: user?.full_name || "Usuário",
            username: user?.username || "usuario",
            avatar: user?.avatar_url || undefined,
          },
          content: post.content || undefined,
          type: post.type,
          media: post.media_url
            ? {
                url: post.media_url,
                thumbnail: post.media_thumbnail || undefined,
              }
            : undefined,
          gallery: post.gallery_items || undefined,
          document: post.document_url
            ? {
                url: post.document_url,
                name: post.document_name || "Documento",
              }
            : undefined,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
          timeAgo: getTimeAgo(post.created_at),
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      collection: {
        ...collection,
        posts,
        postsCount: posts.length,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Atualizar coleção
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { collectionId } = await params;
    const body = await request.json();

    // Verificar se a coleção pertence ao usuário
    const { data: collection } = await supabase
      .from("collections")
      .select("user_id")
      .eq("id", collectionId)
      .single();

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("collections")
      .update({
        name: body.name?.trim(),
        description: body.description?.trim() || null,
        is_public: body.is_public,
        cover_image_url: body.cover_image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", collectionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ collection: data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Deletar coleção
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { collectionId } = await params;

    // Verificar se a coleção pertence ao usuário
    const { data: collection } = await supabase
      .from("collections")
      .select("user_id")
      .eq("id", collectionId)
      .single();

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection", details: errorMessage },
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
