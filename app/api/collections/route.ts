import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// GET - Listar coleções do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";
    const userId = searchParams.get("userId");

    let query = supabase
      .from("collections")
      .select("*")
      .order("updated_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
      if (!publicOnly) {
        // Se não for o próprio usuário, só mostrar públicas
        if (userId !== session.userId) {
          query = query.eq("is_public", true);
        }
      } else {
        query = query.eq("is_public", true);
      }
    } else {
      // Se não especificar userId, mostrar apenas do usuário logado
      query = query.eq("user_id", session.userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ collections: data || [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Criar nova coleção
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const { name, description, is_public, cover_image_url } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: session.userId,
        name: name.trim(),
        description: description?.trim() || null,
        is_public: is_public || false,
        cover_image_url: cover_image_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ collection: data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection", details: errorMessage },
      { status: 500 }
    );
  }
}
