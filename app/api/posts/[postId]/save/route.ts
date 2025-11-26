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

    // Verificar se já salvou
    const { data: existingSave } = await supabase
      .from("post_saves")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.userId)
      .single();

    if (existingSave) {
      // Já salvou, então remover
      await supabase
        .from("post_saves")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", session.userId);

      return NextResponse.json({ saved: false });
    } else {
      // Salvar
      await supabase.from("post_saves").insert({
        post_id: postId,
        user_id: session.userId,
      });

      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in save route:", error);
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
      return NextResponse.json({ isSaved: false });
    }

    const supabase = createAdminClient();

    const { data: save } = await supabase
      .from("post_saves")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", session.userId)
      .single();

    return NextResponse.json({ isSaved: !!save });
  } catch {
    return NextResponse.json({ isSaved: false });
  }
}
