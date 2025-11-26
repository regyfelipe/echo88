import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (session.userId === userId) {
      return NextResponse.json(
        { error: "Cannot mute yourself" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verificar se já está silenciado
    const { data: existing } = await supabase
      .from("user_mutes")
      .select("id")
      .eq("muter_id", session.userId)
      .eq("muted_id", userId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "User already muted" }, { status: 400 });
    }

    // Silenciar usuário
    const { data: mute, error: muteError } = await supabase
      .from("user_mutes")
      .insert({
        muter_id: session.userId,
        muted_id: userId,
      })
      .select()
      .single();

    if (muteError) {
      console.error("Error muting user:", muteError);
      return NextResponse.json(
        { error: "Failed to mute user", details: muteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, mute });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in mute route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("user_mutes")
      .delete()
      .eq("muter_id", session.userId)
      .eq("muted_id", userId);

    if (error) {
      console.error("Error unmuting user:", error);
      return NextResponse.json(
        { error: "Failed to unmute user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in unmute route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

