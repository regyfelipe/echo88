import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = createAdminClient();

    // Buscar comentários do post
    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        parent_id,
        likes_count,
        replies_count,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .eq("post_id", postId)
      .is("parent_id", null) // Apenas comentários principais (não respostas)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments", details: error.message },
        { status: 500 }
      );
    }

    // Buscar respostas para cada comentário
    interface CommentRow {
      id: string;
      parent_id?: string | null;
    }
    if (comments && comments.length > 0) {
      const commentIds = (comments as CommentRow[]).map((c) => c.id);
      const { data: replies } = await supabase
        .from("comments")
        .select(
          `
          id,
          post_id,
          user_id,
          content,
          parent_id,
          likes_count,
          replies_count,
          created_at,
          updated_at,
          users:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `
        )
        .in("parent_id", commentIds)
        .order("created_at", { ascending: true });

      // Agrupar respostas por comentário
      interface ReplyRow {
        parent_id: string;
        [key: string]: unknown;
      }
      const repliesMap = new Map<string, ReplyRow[]>();
      (replies as ReplyRow[] | null)?.forEach((reply) => {
        const parentId = reply.parent_id;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push(reply);
      });

      // Adicionar respostas aos comentários
      const commentsWithReplies = (comments as CommentRow[]).map((comment) => ({
        ...comment,
        replies: repliesMap.get(comment.id) || [],
      }));

      return NextResponse.json({ comments: commentsWithReplies });
    }

    return NextResponse.json({ comments: [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in comments route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

