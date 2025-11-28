import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

/**
 * DELETE /api/stories/[storyId]
 * Deletar uma story
 */
export async function DELETE(
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

    // Verificar se a story pertence ao usuário
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("user_id")
      .eq("id", storyId)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.user_id !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Deletar story (cascade deleta as views também)
    const { error } = await supabase.from("stories").delete().eq("id", storyId);

    if (error) {
      console.error("Error deleting story:", error);
      return NextResponse.json(
        { error: "Failed to delete story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/stories/[storyId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
