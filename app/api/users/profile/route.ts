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
        "id, username, full_name, avatar_url, email, bio, cover_image_url, theme_color, custom_font, layout_style, accent_color, custom_emoji"
      )
      .eq("id", session.userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      avatar: user.avatar_url || null,
      email: user.email,
      bio: user.bio || null,
      coverImage: user.cover_image_url || null,
      themeColor: user.theme_color || null,
      customFont: user.custom_font || null,
      layoutStyle: user.layout_style || "default",
      accentColor: user.accent_color || null,
      customEmoji: user.custom_emoji || null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in profile route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      fullName,
      bio,
      avatarUrl,
      coverImageUrl,
      themeColor,
      customFont,
      layoutStyle,
      accentColor,
      customEmoji,
    } = body;

    const supabase = createAdminClient();

    // Verificar se o username já existe (se foi alterado)
    if (username) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, username")
        .eq("username", username)
        .neq("id", session.userId)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: "Username já está em uso" },
          { status: 400 }
        );
      }
    }

    interface UpdateData {
      username?: string;
      full_name?: string;
      bio?: string | null;
      avatar_url?: string | null;
      cover_image_url?: string | null;
      theme_color?: string | null;
      custom_font?: string | null;
      layout_style?: string;
      accent_color?: string | null;
      custom_emoji?: string | null;
    }
    const updateData: UpdateData = {};

    if (username && username.trim().length >= 3) {
      updateData.username = username.trim();
    }
    if (fullName && fullName.trim().length > 0) {
      updateData.full_name = fullName.trim();
    }
    if (bio !== undefined) {
      updateData.bio = bio?.trim() || null;
    }
    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl || null;
    }
    if (coverImageUrl !== undefined) {
      updateData.cover_image_url = coverImageUrl || null;
    }
    if (themeColor !== undefined) {
      updateData.theme_color = themeColor?.trim() || null;
    }
    if (customFont !== undefined) {
      updateData.custom_font = customFont?.trim() || null;
    }
    if (
      layoutStyle !== undefined &&
      ["default", "compact", "spacious", "minimal"].includes(layoutStyle)
    ) {
      updateData.layout_style = layoutStyle;
    }
    if (accentColor !== undefined) {
      updateData.accent_color = accentColor?.trim() || null;
    }
    if (customEmoji !== undefined) {
      updateData.custom_emoji = customEmoji?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", session.userId)
      .select(
        "id, username, full_name, avatar_url, email, bio, cover_image_url, theme_color, custom_font, layout_style, accent_color, custom_emoji"
      )
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.full_name,
        avatar: updatedUser.avatar_url || null,
        email: updatedUser.email,
        bio: updatedUser.bio || null,
        coverImage: updatedUser.cover_image_url || null,
        themeColor: updatedUser.theme_color || null,
        customFont: updatedUser.custom_font || null,
        layoutStyle: updatedUser.layout_style || "default",
        accentColor: updatedUser.accent_color || null,
        customEmoji: updatedUser.custom_emoji || null,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in profile route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
