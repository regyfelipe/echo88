import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/stories
 * Listar stories ativas (não expiradas) de usuários seguidos
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId;

    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    let query = supabase
      .from("stories")
      .select(
        `
        id,
        user_id,
        media_url,
        media_type,
        media_thumbnail,
        content,
        expires_at,
        views_count,
        created_at,
        users:user_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    // Se userId fornecido, buscar stories desse usuário
    if (userIdParam) {
      query = query.eq("user_id", userIdParam);
    } else if (userId) {
      // Se autenticado, buscar stories de usuários seguidos
      const { data: following } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", userId);

      const followingIds =
        following?.map((f: { following_id: string }) => f.following_id) || [];
      followingIds.push(userId); // Incluir próprio usuário

      query = query.in("user_id", followingIds);
    }

    const { data: stories, error } = await query;

    if (error) {
      console.error("Error fetching stories:", error);
      return NextResponse.json(
        { error: "Failed to fetch stories" },
        { status: 500 }
      );
    }

    // Agrupar stories por usuário
    const storiesByUser = new Map<
      string,
      {
        user: {
          id: string;
          name: string;
          username: string;
          avatar?: string;
        } | null;
        stories: Array<{
          id: string;
          media_url: string;
          media_type: string;
          media_thumbnail?: string;
          content?: string;
          expires_at: string;
          views_count: number;
          created_at: string;
        }>;
      }
    >();

    interface StoryRow {
      id: string;
      user_id: string;
      media_url: string;
      media_type: string;
      media_thumbnail?: string;
      content?: string;
      expires_at: string;
      views_count: number;
      created_at: string;
      users?:
        | {
            id: string;
            full_name?: string;
            username: string;
            avatar_url?: string;
          }
        | null
        | Array<{
            id: string;
            full_name?: string;
            username: string;
            avatar_url?: string;
          }>;
    }

    stories?.forEach((story: StoryRow) => {
      const userId = story.user_id;
      if (!storiesByUser.has(userId)) {
        // Mapear dados do usuário para o formato esperado
        // users pode ser um objeto, array ou null
        const userObj = Array.isArray(story.users)
          ? story.users[0]
          : story.users;
        const userData = userObj
          ? {
              id: userObj.id,
              name: userObj.full_name || userObj.username || "Usuário",
              username: userObj.username || "",
              avatar: userObj.avatar_url || undefined,
            }
          : null;

        storiesByUser.set(userId, {
          user: userData,
          stories: [],
        });
      }
      const userGroup = storiesByUser.get(userId);
      if (userGroup) {
        userGroup.stories.push({
          id: story.id,
          media_url: story.media_url,
          media_type: story.media_type,
          media_thumbnail: story.media_thumbnail,
          content: story.content,
          expires_at: story.expires_at,
          views_count: story.views_count,
          created_at: story.created_at,
        });
      }
    });

    // Verificar quais stories o usuário já visualizou
    let viewedStories: string[] = [];
    if (userId && stories && stories.length > 0) {
      const storyIds = stories.map((s: StoryRow) => s.id);
      const { data: views } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("user_id", userId)
        .in("story_id", storyIds);

      viewedStories = views?.map((v: { story_id: string }) => v.story_id) || [];
    }

    // Adicionar flag has_viewed
    const result = Array.from(storiesByUser.values()).map((group) => ({
      ...group,
      stories: group.stories.map((story) => ({
        ...story,
        has_viewed: viewedStories.includes(story.id),
      })),
    }));

    return NextResponse.json({ stories: result });
  } catch (error) {
    console.error("Error in GET /api/stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
