import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, platform } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Incrementar contador de compartilhamentos
    const { error: updateError } = await supabase.rpc("increment", {
      table_name: "posts",
      column_name: "shares_count",
      row_id: postId,
      increment_value: 1,
    });

    if (updateError) {
      // Fallback: usar UPDATE direto
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

    // Buscar dados do post para compartilhamento
    const { data: postData } = await supabase
      .from("posts")
      .select(
        `
        id,
        content,
        type,
        media_url,
        users:user_id (
          username
        )
      `
      )
      .eq("id", postId)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/posts/${postId}`;
    interface UserData {
      username?: string;
    }
    const users = postData?.users as UserData | UserData[] | null | undefined;
    const username = Array.isArray(users)
      ? users[0]?.username
      : users?.username;
    const shareText = postData?.content
      ? `${postData.content.substring(0, 100)}...`
      : `Post de @${username || "usuario"}`;

    // URLs de compartilhamento para diferentes plataformas
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        `${shareText} ${shareUrl}`
      )}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
    };

    return NextResponse.json({
      success: true,
      shareUrl: shareUrl, // Sempre retornar a URL base
      shareUrls, // URLs específicas por plataforma
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in share route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
