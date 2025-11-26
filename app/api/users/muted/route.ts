import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Buscar usuários silenciados
    const { data: mutes, error } = await supabase
      .from("user_mutes")
      .select(
        `
        id,
        created_at,
        muted:muted_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("muter_id", session.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching muted users:", error);
      return NextResponse.json(
        { error: "Failed to fetch muted users", details: error.message },
        { status: 500 }
      );
    }

    interface MutedUser {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    }
    interface MuteRow {
      muted: MutedUser | MutedUser[];
      created_at: string;
    }
    const mutedUsers = ((mutes as unknown as MuteRow[] | null) || []).map(
      (mute) => {
        const mutedUser = Array.isArray(mute.muted)
          ? mute.muted[0]
          : mute.muted;
        return {
          id: mutedUser?.id || "",
          username: mutedUser?.username || "",
          fullName: mutedUser?.full_name || null,
          avatar: mutedUser?.avatar_url || null,
          mutedAt: mute.created_at,
        };
      }
    );

    return NextResponse.json({ mutedUsers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in muted users route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
