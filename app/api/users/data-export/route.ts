import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * API para exportação de dados pessoais (LGPD)
 * Retorna todos os dados do usuário em formato JSON
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Buscar todos os dados do usuário
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    // Buscar posts do usuário
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false });

    // Buscar comentários do usuário
    const { data: comments } = await supabase
      .from("comments")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false });

    // Buscar likes do usuário
    const { data: likes } = await supabase
      .from("post_likes")
      .select("*")
      .eq("user_id", session.userId);

    // Buscar saves do usuário
    const { data: saves } = await supabase
      .from("post_saves")
      .select("*")
      .eq("user_id", session.userId);

    // Buscar seguidores
    const { data: followers } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", session.userId);

    // Buscar seguindo
    const { data: following } = await supabase
      .from("followers")
      .select("*")
      .eq("following_id", session.userId);

    // Buscar mensagens diretas
    const { data: messages } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`sender_id.eq.${session.userId},receiver_id.eq.${session.userId}`)
      .order("created_at", { ascending: false });

    // Buscar bloqueios
    const { data: blocks } = await supabase
      .from("user_blocks")
      .select("*")
      .eq("blocker_id", session.userId);

    // Buscar silenciamentos
    const { data: mutes } = await supabase
      .from("user_mutes")
      .select("*")
      .eq("muter_id", session.userId);

    // Buscar sessões de login
    const { data: sessions } = await supabase
      .from("login_sessions")
      .select("*")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false });

    // Compilar todos os dados
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        settings: {
          isPrivate: user.is_private,
          showOnlineStatus: user.show_online_status,
          allowDirectMessages: user.allow_direct_messages,
          themePreference: user.theme_preference,
          languagePreference: user.language_preference,
          notifications: {
            email: user.notification_email,
            likes: user.notification_likes,
            comments: user.notification_comments,
            follows: user.notification_follows,
            mentions: user.notification_mentions,
            shares: user.notification_shares,
          },
        },
      },
      posts: posts || [],
      comments: comments || [],
      likes: likes || [],
      saves: saves || [],
      followers: followers || [],
      following: following || [],
      messages: messages || [],
      blockedUsers: blocks || [],
      mutedUsers: mutes || [],
      loginSessions: sessions || [],
      statistics: {
        totalPosts: posts?.length || 0,
        totalComments: comments?.length || 0,
        totalLikes: likes?.length || 0,
        totalSaves: saves?.length || 0,
        totalFollowers: followers?.length || 0,
        totalFollowing: following?.length || 0,
        totalMessages: messages?.length || 0,
        totalBlocked: blocks?.length || 0,
        totalMuted: mutes?.length || 0,
        totalSessions: sessions?.length || 0,
      },
    };

    // Retornar como JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="echo88-dados-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in data export route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

