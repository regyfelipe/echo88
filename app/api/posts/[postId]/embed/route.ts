import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = createAdminClient();

    // Buscar dados do post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        "id, content, type, media_url, media_thumbnail, gallery_items, created_at, user_id"
      )
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Buscar dados do usuário separadamente
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name, username, avatar_url")
      .eq("id", post.user_id)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
    }

    // Retornar dados formatados para embed
    return NextResponse.json({
      type: "rich",
      version: "1.0",
      title: `Post de @${user?.username || "usuario"}`,
      description: post.content || "Post no Echo88",
      url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/posts/${postId}`,
      image: post.media_url || post.media_thumbnail || null,
      author: {
        name: user?.full_name || "Usuário",
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/@${
          user?.username || "usuario"
        }`,
      },
      provider: {
        name: "Echo88",
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in embed route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
