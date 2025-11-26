import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content, parentId } = body;

    if (!postId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Criar comentário
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: session.userId,
        parent_id: parentId || null,
        content: content.trim(),
      })
      .select(
        `
        id,
        post_id,
        user_id,
        parent_id,
        content,
        likes_count,
        replies_count,
        created_at,
        users:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .single();

    if (commentError) {
      console.error("Error creating comment:", commentError);
      return NextResponse.json(
        { error: "Failed to create comment", details: commentError.message },
        { status: 500 }
      );
    }

    // Buscar o autor do post para criar notificação
    const { data: postData } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    // Criar notificação para o autor do post (não bloquear se falhar)
    if (postData?.user_id && postData.user_id !== session.userId) {
      try {
        await supabase.from("notifications").insert({
          user_id: postData.user_id,
          type: parentId ? "reply" : "comment",
          actor_id: session.userId,
          post_id: postId,
          comment_id: comment.id,
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Não falhar a requisição se a notificação falhar
      }
    }

    // Processar hashtags e menções (assíncrono, não bloqueia a resposta)
    if (content) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/posts/process-hashtags-mentions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commentId: comment.id,
            content,
            userId: session.userId,
          }),
        }
      ).catch((err) => {
        console.error("Error processing hashtags/mentions:", err);
      });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create comment route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
