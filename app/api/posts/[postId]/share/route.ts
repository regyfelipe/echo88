import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { platform } = body; // 'facebook', 'twitter', 'whatsapp', 'copy_link', etc.

    const session = await getSession();
    const supabase = createAdminClient();

    // Incrementar contador de compartilhamentos
    const { error } = await supabase.rpc("increment_post_shares", {
      post_id: postId,
    });

    // Se a função RPC não existir, fazer manualmente
    if (error) {
      const { data: post } = await supabase
        .from("posts")
        .select("shares_count")
        .eq("id", postId)
        .single();

      if (post) {
        await supabase
          .from("posts")
          .update({ shares_count: (post.shares_count || 0) + 1 })
          .eq("id", postId);
      }
    }

    // Gerar URL de compartilhamento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/posts/${postId}`;

    // Retornar URL de compartilhamento baseado na plataforma
    let shareLink = shareUrl;
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "copy_link":
        // Retornar URL para copiar
        break;
    }

    // Criar notificação para o autor do post (não bloquear se falhar)
    if (session?.userId) {
      try {
        const { data: postData } = await supabase
          .from("posts")
          .select("user_id")
          .eq("id", postId)
          .single();

        if (postData?.user_id && postData.user_id !== session.userId) {
          await supabase.from("notifications").insert({
            user_id: postData.user_id,
            type: "share",
            actor_id: session.userId,
            post_id: postId,
          });
        }
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Não falhar a requisição se a notificação falhar
      }
    }

    return NextResponse.json({
      success: true,
      shareUrl: shareLink,
      platform,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in share route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
