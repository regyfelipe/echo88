import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/stories/create
 * Criar uma nova story (temporária, 24h)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { media_url, media_type, media_thumbnail, content } = body;

    // Validações
    if (!media_url || !media_type) {
      return NextResponse.json(
        { error: "media_url and media_type are required" },
        { status: 400 }
      );
    }

    if (!["image", "video"].includes(media_type)) {
      return NextResponse.json(
        { error: "media_type must be 'image' or 'video'" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Criar story com expiração de 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: story, error } = await supabase
      .from("stories")
      .insert({
        user_id: session.userId,
        media_url,
        media_type,
        media_thumbnail: media_thumbnail || null,
        content: content || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating story:", error);
      return NextResponse.json(
        { error: "Failed to create story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/stories/create:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
