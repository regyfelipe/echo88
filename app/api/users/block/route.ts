import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (session.userId === userId) {
      return NextResponse.json(
        { error: "Cannot block yourself" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verificar se já está bloqueado
    const { data: existing } = await supabase
      .from("user_blocks")
      .select("id")
      .eq("blocker_id", session.userId)
      .eq("blocked_id", userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "User already blocked" }, { status: 400 });
    }

    // Bloquear usuário
    const { data: block, error: blockError } = await supabase
      .from("user_blocks")
      .insert({
        blocker_id: session.userId,
        blocked_id: userId,
      })
      .select()
      .single();

    if (blockError) {
      console.error("Error blocking user:", blockError);
      return NextResponse.json(
        { error: "Failed to block user", details: blockError.message },
        { status: 500 }
      );
    }

    // Remover follow se existir (em ambas as direções)
    await supabase
      .from("followers")
      .delete()
      .eq("follower_id", session.userId)
      .eq("following_id", userId);
    
    await supabase
      .from("followers")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", session.userId);
    
    // Também remover silenciamento se existir
    await supabase
      .from("user_mutes")
      .delete()
      .eq("muter_id", session.userId)
      .eq("muted_id", userId);
    
    await supabase
      .from("user_mutes")
      .delete()
      .eq("muter_id", userId)
      .eq("muted_id", session.userId);

    return NextResponse.json({ success: true, block });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in block route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", session.userId)
      .eq("blocked_id", userId);

    if (error) {
      console.error("Error unblocking user:", error);
      return NextResponse.json(
        { error: "Failed to unblock user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in unblock route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

