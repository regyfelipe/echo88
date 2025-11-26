import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// GET - Buscar preferências de feed
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ feedType: "chronological" }, { status: 200 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("user_feed_preferences")
      .select("feed_type")
      .eq("user_id", session.userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({
      feedType: data?.feed_type || "chronological",
    });
  } catch {
    return NextResponse.json({ feedType: "chronological" }, { status: 200 });
  }
}

// PUT - Atualizar preferências de feed
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const { feedType } = body;

    if (!["chronological", "relevance", "personalized"].includes(feedType)) {
      return NextResponse.json({ error: "Invalid feed type" }, { status: 400 });
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from("user_feed_preferences")
      .select("id")
      .eq("user_id", session.userId)
      .single();

    if (existing) {
      // Atualizar
      const { data, error } = await supabase
        .from("user_feed_preferences")
        .update({
          feed_type: feedType,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.userId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ feedType: data.feed_type });
    } else {
      // Criar
      const { data, error } = await supabase
        .from("user_feed_preferences")
        .insert({
          user_id: session.userId,
          feed_type: feedType,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ feedType: data.feed_type });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating feed preferences:", error);
    return NextResponse.json(
      { error: "Failed to update feed preferences", details: errorMessage },
      { status: 500 }
    );
  }
}
