import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createAdminClient();

    // Buscar quem o usuário está seguindo
    const { data: following, error } = await supabase
      .from("followers")
      .select(
        `
        id,
        following_id,
        created_at,
        following:following_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching following:", error);
      return NextResponse.json(
        { error: "Failed to fetch following", details: error.message },
        { status: 500 }
      );
    }

    // Formatar dados para facilitar o uso no frontend
    interface FollowingRow {
      id: string;
      following_id: string;
      created_at: string;
      following: unknown;
    }
    const formattedFollowing = ((following as FollowingRow[] | null) || []).map((item) => ({
      id: item.id,
      following_id: item.following_id,
      created_at: item.created_at,
      following: item.following || null,
    }));

    return NextResponse.json({ following: formattedFollowing });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in following route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
