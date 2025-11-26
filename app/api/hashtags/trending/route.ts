import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Buscar hashtags mais populares
    const { data: hashtags, error } = await supabase
      .from("hashtags")
      .select("*")
      .order("posts_count", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching trending hashtags:", error);
      return NextResponse.json(
        { error: "Failed to fetch trending hashtags", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hashtags: hashtags || [],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in trending hashtags route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

