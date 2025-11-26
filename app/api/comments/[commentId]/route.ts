import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Verificar se o comentário pertence ao usuário
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("id, user_id, post_id, parent_id")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.user_id !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Deletar o comentário
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete comment", details: deleteError.message },
        { status: 500 }
      );
    }

    // Se era um comentário principal, decrementar comments_count do post
    // Se era uma resposta, decrementar replies_count do comentário pai
    if (!comment.parent_id) {
      // Comentário principal - decrementar comments_count do post
      const { data: post } = await supabase
        .from("posts")
        .select("comments_count")
        .eq("id", comment.post_id)
        .single();

      if (post) {
        await supabase
          .from("posts")
          .update({
            comments_count: Math.max((post.comments_count || 0) - 1, 0),
          })
          .eq("id", comment.post_id);
      }
    } else {
      // Resposta - decrementar replies_count do comentário pai
      const { data: parentComment } = await supabase
        .from("comments")
        .select("replies_count")
        .eq("id", comment.parent_id)
        .single();

      if (parentComment) {
        await supabase
          .from("comments")
          .update({
            replies_count: Math.max((parentComment.replies_count || 0) - 1, 0),
          })
          .eq("id", comment.parent_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in delete comment route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
