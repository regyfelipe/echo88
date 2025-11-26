import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ isFollowing: false });
    }

    const supabase = createAdminClient();

    // Verificar se está seguindo
    const { data: follow } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", session.userId)
      .eq("following_id", userId)
      .single();

    return NextResponse.json({ isFollowing: !!follow });
  } catch {
    return NextResponse.json({ isFollowing: false });
  }
}
