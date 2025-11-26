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

    // Buscar usuários bloqueados
    const { data: blocks, error } = await supabase
      .from("user_blocks")
      .select(
        `
        id,
        created_at,
        blocked:blocked_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("blocker_id", session.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blocked users:", error);
      return NextResponse.json(
        { error: "Failed to fetch blocked users", details: error.message },
        { status: 500 }
      );
    }

    interface BlockedUser {
      id: string;
      username: string;
      full_name: string | null;
      avatar_url: string | null;
    }
    interface BlockRow {
      blocked: BlockedUser | BlockedUser[];
      created_at: string;
    }
    const blockedUsers = ((blocks as unknown as BlockRow[] | null) || []).map(
      (block) => {
        const blockedUser = Array.isArray(block.blocked)
          ? block.blocked[0]
          : block.blocked;
        return {
          id: blockedUser?.id || "",
          username: blockedUser?.username || "",
          fullName: blockedUser?.full_name || null,
          avatar: blockedUser?.avatar_url || null,
          blockedAt: block.created_at,
        };
      }
    );

    return NextResponse.json({ blockedUsers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in blocked users route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
