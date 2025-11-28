import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/stories/[storyId]/view
 * Registrar visualização de uma story
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyId } = await params;
    const supabase = await createServerClient();

    // Verificar se a story existe e não está expirada
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("id, user_id, expires_at, views_count")
      .eq("id", storyId)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: "Story not found or expired" },
        { status: 404 }
      );
    }

    // Não permitir que o usuário veja sua própria story como "visualizada"
    // Mas ainda incrementar o contador
    if (story.user_id !== session.userId) {
      // Registrar visualização usando upsert para evitar duplicatas
      const { error: viewError } = await supabase.from("story_views").upsert(
        {
          story_id: storyId,
          user_id: session.userId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: "story_id,user_id",
          ignoreDuplicates: true,
        }
      );

      if (viewError && !viewError.message.includes("duplicate")) {
        console.error("Error creating story view:", viewError);
      }

      // Incrementar contador de visualizações apenas se a view foi criada
      // (não incrementar se já existia)
      if (!viewError || !viewError.message.includes("duplicate")) {
        await supabase
          .from("stories")
          .update({ views_count: (story.views_count || 0) + 1 })
          .eq("id", storyId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in POST /api/stories/[storyId]/view:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
