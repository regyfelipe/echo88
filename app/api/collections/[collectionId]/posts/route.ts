import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

// POST - Adicionar post à coleção
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { collectionId } = await params;
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Verificar se a coleção pertence ao usuário
    const { data: collection } = await supabase
      .from("collections")
      .select("user_id")
      .eq("id", collectionId)
      .single();

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verificar se o post já está na coleção
    const { data: existing } = await supabase
      .from("collection_posts")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("post_id", postId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Post already in collection" },
        { status: 400 }
      );
    }

    // Buscar a última posição
    const { data: lastPost } = await supabase
      .from("collection_posts")
      .select("position")
      .eq("collection_id", collectionId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const position = (lastPost?.position || 0) + 1;

    // Adicionar post à coleção
    const { data, error } = await supabase
      .from("collection_posts")
      .insert({
        collection_id: collectionId,
        post_id: postId,
        position,
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar updated_at da coleção
    await supabase
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", collectionId);

    return NextResponse.json({ success: true, collectionPost: data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error adding post to collection:", error);
    return NextResponse.json(
      { error: "Failed to add post to collection", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Remover post da coleção
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { collectionId } = await params;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Verificar se a coleção pertence ao usuário
    const { data: collection } = await supabase
      .from("collections")
      .select("user_id")
      .eq("id", collectionId)
      .single();

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase
      .from("collection_posts")
      .delete()
      .eq("collection_id", collectionId)
      .eq("post_id", postId);

    if (error) throw error;

    // Atualizar updated_at da coleção
    await supabase
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", collectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error removing post from collection:", error);
    return NextResponse.json(
      { error: "Failed to remove post from collection", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Reordenar posts na coleção
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { collectionId } = await params;
    const body = await request.json();
    const { postIds } = body; // Array de IDs na nova ordem

    if (!Array.isArray(postIds)) {
      return NextResponse.json(
        { error: "postIds must be an array" },
        { status: 400 }
      );
    }

    // Verificar se a coleção pertence ao usuário
    const { data: collection } = await supabase
      .from("collections")
      .select("user_id")
      .eq("id", collectionId)
      .single();

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Atualizar posições
    const updates = postIds.map((postId: string, index: number) =>
      supabase
        .from("collection_posts")
        .update({ position: index + 1 })
        .eq("collection_id", collectionId)
        .eq("post_id", postId)
    );

    await Promise.all(updates);

    // Atualizar updated_at da coleção
    await supabase
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", collectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error reordering posts:", error);
    return NextResponse.json(
      { error: "Failed to reorder posts", details: errorMessage },
      { status: 500 }
    );
  }
}

