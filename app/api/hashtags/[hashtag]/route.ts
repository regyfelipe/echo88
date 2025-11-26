import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hashtag: string }> }
) {
  try {
    const { hashtag } = await params;
    const supabase = createAdminClient();

    // Buscar hashtag
    const { data: hashtagData, error: hashtagError } = await supabase
      .from("hashtags")
      .select("*")
      .eq("name", hashtag.toLowerCase())
      .single();

    if (hashtagError || !hashtagData) {
      return NextResponse.json({ error: "Hashtag not found" }, { status: 404 });
    }

    // Buscar posts com essa hashtag
    const { data: postHashtags, error: postHashtagsError } = await supabase
      .from("post_hashtags")
      .select(
        `
        post_id,
        posts:post_id (
          id,
          user_id,
          content,
          type,
          media_url,
          media_thumbnail,
          gallery_items,
          document_url,
          document_name,
          likes_count,
          comments_count,
          shares_count,
          views_count,
          created_at,
          users:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `
      )
      .eq("hashtag_id", hashtagData.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (postHashtagsError) {
      console.error("Error fetching posts with hashtag:", postHashtagsError);
      return NextResponse.json(
        { error: "Failed to fetch posts", details: postHashtagsError.message },
        { status: 500 }
      );
    }

    interface PostHashtagRow {
      posts: unknown;
    }
    const posts = ((postHashtags as PostHashtagRow[] | null) || [])
      .map((ph) => ph.posts)
      .filter((p) => p !== null);

    return NextResponse.json({
      hashtag: hashtagData,
      posts,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in hashtag route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
