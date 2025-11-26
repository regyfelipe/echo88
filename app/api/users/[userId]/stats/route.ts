import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Contar posts do usuário
    const { count: postsCount, error: postsError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (postsError) {
      console.error("Error counting posts:", postsError);
    }

    // Contar visualizações totais dos posts do usuário
    const { data: postsData, error: viewsError } = await supabase
      .from("posts")
      .select("views_count")
      .eq("user_id", userId);

    let viewsCount = 0;
    if (!viewsError && postsData) {
      viewsCount = postsData.reduce(
        (sum, post) => sum + (post.views_count || 0),
        0
      );
    }

    // Contar seguidores (pessoas que seguem este usuário)
    const { count: followersCount, error: followersError } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    if (followersError) {
      console.error("Error counting followers:", followersError);
    }

    // Contar seguindo (pessoas que este usuário segue)
    const { count: followingCount, error: followingError } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (followingError) {
      console.error("Error counting following:", followingError);
    }

    return NextResponse.json({
      posts: postsCount || 0,
      followers: followersCount || 0,
      following: followingCount || 0,
      views: viewsCount,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in user stats route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
