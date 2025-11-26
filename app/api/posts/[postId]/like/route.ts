import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Verificar se já curtiu
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.userId)
      .single();

    if (existingLike) {
      // Já curtiu, então descurtir
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", session.userId);

      // Decrementar contador
      const { data: post } = await supabase
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();

      if (post) {
        const newLikesCount = Math.max((post.likes_count || 0) - 1, 0);
        await supabase
          .from("posts")
          .update({ likes_count: newLikesCount })
          .eq("id", postId);

        return NextResponse.json({ liked: false, likes: newLikesCount });
      }

      // Se não encontrar o post, retornar com likes = 0
      return NextResponse.json({ liked: false, likes: 0 });
    } else {
      // Curtir
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: session.userId,
      });

      // Remover dislike se existir (não pode ter like e dislike ao mesmo tempo)
      const { data: existingDislike } = await supabase
        .from("post_dislikes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", session.userId)
        .single();

      if (existingDislike) {
        await supabase
          .from("post_dislikes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", session.userId);

        // Decrementar contador de dislikes
        const { data: post } = await supabase
          .from("posts")
          .select("dislikes_count")
          .eq("id", postId)
          .single();

        if (post) {
          await supabase
            .from("posts")
            .update({
              dislikes_count: Math.max((post.dislikes_count || 0) - 1, 0),
            })
            .eq("id", postId);
        }
      }

      // Incrementar contador
      const { data: post } = await supabase
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();

      if (post) {
        const newLikesCount = (post.likes_count || 0) + 1;
        await supabase
          .from("posts")
          .update({ likes_count: newLikesCount })
          .eq("id", postId);

        // Buscar o autor do post para criar notificação
        const { data: postData } = await supabase
          .from("posts")
          .select("user_id")
          .eq("id", postId)
          .single();

        // Criar notificação (não bloquear se falhar)
        if (postData?.user_id && postData.user_id !== session.userId) {
          try {
            await supabase.from("notifications").insert({
              user_id: postData.user_id,
              type: "like",
              actor_id: session.userId,
              post_id: postId,
            });
          } catch (notifError) {
            console.error("Error creating notification:", notifError);
            // Não falhar a requisição se a notificação falhar
          }
        }

        return NextResponse.json({ liked: true, likes: newLikesCount });
      }

      // Se não encontrar o post, retornar com likes = 1 (já que acabou de curtir)
      return NextResponse.json({ liked: true, likes: 1 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in like route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ isLiked: false });
    }

    const supabase = createAdminClient();

    const { data: like } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.userId)
      .single();

    return NextResponse.json({ isLiked: !!like });
  } catch {
    return NextResponse.json({ isLiked: false });
  }
}
