import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  extractHashtags,
  extractMentions,
} from "@/lib/utils/hashtags-mentions";

/**
 * Processa hashtags e menções de um post ou comentário
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, commentId, content, userId } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const hashtags = extractHashtags(content);
    const mentions = extractMentions(content);

    // Processar hashtags
    const hashtagIds: string[] = [];
    for (const hashtagName of hashtags) {
      // Buscar ou criar hashtag
      let { data: hashtag } = await supabase
        .from("hashtags")
        .select("id")
        .eq("name", hashtagName)
        .single();

      if (!hashtag) {
        const { data: newHashtag, error: createError } = await supabase
          .from("hashtags")
          .insert({ name: hashtagName })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating hashtag:", createError);
          continue;
        }

        hashtag = newHashtag;
      }

      hashtagIds.push(hashtag.id);

      // Associar hashtag ao post
      if (postId) {
        await supabase.from("post_hashtags").upsert(
          {
            post_id: postId,
            hashtag_id: hashtag.id,
          },
          { onConflict: "post_id,hashtag_id" }
        );
      }
    }

    // Processar menções
    if (userId && (postId || commentId)) {
      for (const username of mentions) {
        // Buscar usuário mencionado
        const { data: mentionedUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .single();

        if (mentionedUser) {
          await supabase.from("mentions").insert({
            post_id: postId || null,
            comment_id: commentId || null,
            mentioned_user_id: mentionedUser.id,
            mentioned_by_user_id: userId,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      hashtags: hashtagIds,
      mentions: mentions.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing hashtags and mentions:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
