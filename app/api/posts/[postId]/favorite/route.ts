import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { postId } = await params;

    // Verificar se já está favoritado
    const { data: existing } = await supabase
      .from("post_favorites")
      .select("id")
      .eq("user_id", session.userId)
      .eq("post_id", postId)
      .single();

    if (existing) {
      // Remover favorito
      const { error } = await supabase
        .from("post_favorites")
        .delete()
        .eq("user_id", session.userId)
        .eq("post_id", postId);

      if (error) throw error;

      return NextResponse.json({ favorited: false });
    } else {
      // Adicionar favorito
      const { error } = await supabase
        .from("post_favorites")
        .insert({
          user_id: session.userId,
          post_id: postId,
        });

      if (error) throw error;

      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ isFavorited: false });
    }

    const supabase = createAdminClient();
    const { postId } = await params;

    const { data } = await supabase
      .from("post_favorites")
      .select("id")
      .eq("user_id", session.userId)
      .eq("post_id", postId)
      .single();

    return NextResponse.json({ isFavorited: !!data });
  } catch {
    return NextResponse.json({ isFavorited: false });
  }
}

