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

    const { data: user, error } = await supabase
      .from("users")
      .select(
        "is_private, show_online_status, allow_direct_messages, theme_preference, language_preference, notification_email, notification_likes, notification_comments, notification_follows, notification_mentions, notification_shares"
      )
      .eq("id", session.userId)
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isPrivate: user?.is_private || false,
      showOnlineStatus: user?.show_online_status ?? true,
      allowDMs: user?.allow_direct_messages ?? true,
      theme: user?.theme_preference || "system",
      language: user?.language_preference || "pt-BR",
      notificationEmail: user?.notification_email ?? true,
      notificationLikes: user?.notification_likes ?? true,
      notificationComments: user?.notification_comments ?? true,
      notificationFollows: user?.notification_follows ?? true,
      notificationMentions: user?.notification_mentions ?? true,
      notificationShares: user?.notification_shares ?? true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in settings route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      isPrivate,
      showOnlineStatus,
      allowDMs,
      email: notificationEmail,
      likes: notificationLikes,
      comments: notificationComments,
      follows: notificationFollows,
      mentions: notificationMentions,
      shares: notificationShares,
    } = body;

    const supabase = createAdminClient();

    interface UpdateData {
      is_private?: boolean;
      show_online_status?: boolean;
      allow_direct_messages?: boolean;
      notification_email?: boolean;
      notification_likes?: boolean;
      notification_comments?: boolean;
      notification_follows?: boolean;
      notification_mentions?: boolean;
      notification_shares?: boolean;
    }
    const updateData: UpdateData = {};

    if (typeof isPrivate === "boolean") {
      updateData.is_private = isPrivate;
    }
    if (typeof showOnlineStatus === "boolean") {
      updateData.show_online_status = showOnlineStatus;
    }
    if (typeof allowDMs === "boolean") {
      updateData.allow_direct_messages = allowDMs;
    }
    if (typeof notificationEmail === "boolean") {
      updateData.notification_email = notificationEmail;
    }
    if (typeof notificationLikes === "boolean") {
      updateData.notification_likes = notificationLikes;
    }
    if (typeof notificationComments === "boolean") {
      updateData.notification_comments = notificationComments;
    }
    if (typeof notificationFollows === "boolean") {
      updateData.notification_follows = notificationFollows;
    }
    if (typeof notificationMentions === "boolean") {
      updateData.notification_mentions = notificationMentions;
    }
    if (typeof notificationShares === "boolean") {
      updateData.notification_shares = notificationShares;
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", session.userId);

    if (error) {
      console.error("Error updating settings:", error);
      return NextResponse.json(
        { error: "Failed to update settings", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in settings route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

