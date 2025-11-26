import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const supabase = createAdminClient();

    // Buscar usuários que o usuário atual ainda não segue
    // Priorizar usuários com mais seguidores e posts recentes
    const { data: allUsers, error: allUsersError } = await supabase
      .from("users")
      .select("id, full_name, username, avatar_url")
      .neq("id", session.userId)
      .limit(limit * 3);

    if (allUsersError) {
      console.error("Error fetching users:", allUsersError);
      return NextResponse.json(
        { error: "Failed to fetch suggestions", details: allUsersError.message },
        { status: 500 }
      );
    }

    // Buscar quem o usuário já segue
    const { data: following, error: followingError } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", session.userId);

    if (followingError) {
      console.error("Error fetching following:", followingError);
    }

    interface FollowingRow {
      following_id: string;
    }
    interface UserRow {
      id: string;
      full_name?: string | null;
      username?: string | null;
      avatar_url?: string | null;
      followersCount?: number;
      recentPostsCount?: number;
      score?: number;
    }
    const followingIds = new Set(
      ((following as FollowingRow[] | null) || []).map((f) => f.following_id)
    );

    // Filtrar usuários que não estão sendo seguidos
    const notFollowing = ((allUsers as UserRow[] | null) || []).filter(
      (user) => !followingIds.has(user.id)
    );

    // Buscar estatísticas de cada usuário para ordenar
    const usersWithStats = await Promise.all(
      notFollowing.slice(0, limit * 2).map(async (user) => {
        // Contar seguidores
        const { count: followersCount } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", user.id);

        // Contar posts recentes (últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: recentPostsCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString());

        return {
          ...user,
          followersCount: followersCount || 0,
          recentPostsCount: recentPostsCount || 0,
          score: (followersCount || 0) * 2 + (recentPostsCount || 0) * 5,
        };
      })
    );

    // Ordenar por score e pegar os top
    const suggestions = usersWithStats
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((user) => ({
        id: user.id,
        name: user.full_name || "Usuário",
        username: user.username || "usuario",
        avatar: user.avatar_url || undefined,
        followersCount: user.followersCount,
      }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in suggestions route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

