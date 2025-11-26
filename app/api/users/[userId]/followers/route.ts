import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createAdminClient();

    // Buscar seguidores
    const { data: followers, error } = await supabase
      .from("followers")
      .select(
        `
        id,
        follower_id,
        created_at,
        follower:follower_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .eq("following_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching followers:", error);
      return NextResponse.json(
        { error: "Failed to fetch followers", details: error.message },
        { status: 500 }
      );
    }

    // Formatar dados para facilitar o uso no frontend
    interface FollowerRow {
      id: string;
      follower_id: string;
      created_at: string;
      follower: unknown;
    }
    const formattedFollowers = ((followers as FollowerRow[] | null) || []).map((item) => ({
      id: item.id,
      follower_id: item.follower_id,
      created_at: item.created_at,
      follower: item.follower || null,
    }));

    return NextResponse.json({ followers: formattedFollowers });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in followers route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
