import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { theme } = await request.json();

    if (!theme || !["light", "dark", "system"].includes(theme)) {
      return NextResponse.json(
        { error: "Invalid theme value" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("users")
      .update({ theme_preference: theme })
      .eq("id", session.userId);

    if (error) {
      console.error("Error updating theme:", error);
      return NextResponse.json(
        { error: "Failed to update theme", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in theme route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ theme: "system" });
    }

    const supabase = createAdminClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("theme_preference")
      .eq("id", session.userId)
      .single();

    if (error) {
      console.error("Error fetching theme:", error);
      return NextResponse.json({ theme: "system" });
    }

    return NextResponse.json({
      theme: (user?.theme_preference as "light" | "dark" | "system") || "system",
    });
  } catch {
    return NextResponse.json({ theme: "system" });
  }
}

