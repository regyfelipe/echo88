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

    // Verificar se já não curtiu
    const { data: existingDislike } = await supabase
      .from("post_dislikes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.userId)
      .single();

    if (existingDislike) {
      // Já não curtiu, então remover dislike
      await supabase
        .from("post_dislikes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", session.userId);

      // Remover like se existir (não pode ter like e dislike ao mesmo tempo)
      await supabase
        .from("post_likes")
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

      return NextResponse.json({ disliked: false });
    } else {
      // Não curtir
      await supabase.from("post_dislikes").insert({
        post_id: postId,
        user_id: session.userId,
      });

      // Remover like se existir (não pode ter like e dislike ao mesmo tempo)
      const { data: existingLike } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", session.userId)
        .single();

      if (existingLike) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", session.userId);

        // Decrementar contador de likes
        const { data: post } = await supabase
          .from("posts")
          .select("likes_count")
          .eq("id", postId)
          .single();

        if (post) {
          await supabase
            .from("posts")
            .update({ likes_count: Math.max((post.likes_count || 0) - 1, 0) })
            .eq("id", postId);
        }
      }

      // Incrementar contador de dislikes
      const { data: post } = await supabase
        .from("posts")
        .select("dislikes_count")
        .eq("id", postId)
        .single();

      if (post) {
        await supabase
          .from("posts")
          .update({ dislikes_count: (post.dislikes_count || 0) + 1 })
          .eq("id", postId);
      }

      return NextResponse.json({ disliked: true });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in dislike route:", error);
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
      return NextResponse.json({ isDisliked: false });
    }

    const supabase = createAdminClient();

    const { data: dislike } = await supabase
      .from("post_dislikes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.userId)
      .single();

    return NextResponse.json({ isDisliked: !!dislike });
  } catch {
    return NextResponse.json({ isDisliked: false });
  }
}
