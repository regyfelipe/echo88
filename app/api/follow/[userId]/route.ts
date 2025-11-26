import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.userId === userId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verificar se já está seguindo
    const { data: existing } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", session.userId)
      .eq("following_id", userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }

    // Criar relação de seguir
    const { data: follow, error: followError } = await supabase
      .from("followers")
      .insert({
        follower_id: session.userId,
        following_id: userId,
      })
      .select()
      .single();

    if (followError) {
      console.error("Error following user:", followError);
      return NextResponse.json(
        { error: "Failed to follow user", details: followError.message },
        { status: 500 }
      );
    }

    // Criar notificação (não bloquear se falhar)
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "follow",
        actor_id: session.userId,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Não falhar a requisição se a notificação falhar
    }

    return NextResponse.json({ success: true, follow });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in follow route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Deixar de seguir
    const { error: unfollowError } = await supabase
      .from("followers")
      .delete()
      .eq("follower_id", session.userId)
      .eq("following_id", userId);

    if (unfollowError) {
      console.error("Error unfollowing user:", unfollowError);
      return NextResponse.json(
        { error: "Failed to unfollow user", details: unfollowError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in unfollow route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
