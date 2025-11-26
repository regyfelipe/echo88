import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createAdminClient();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sb-access-token");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar sessão do usuário
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar mensagens entre os dois usuários
    const { data: messages, error } = await supabase
      .from("direct_messages")
      .select(
        `
        id,
        sender_id,
        receiver_id,
        content,
        is_read,
        created_at,
        sender:sender_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        receiver:receiver_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages", details: error.message },
        { status: 500 }
      );
    }

    // Marcar mensagens como lidas
    await supabase
      .from("direct_messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .eq("sender_id", userId)
      .eq("is_read", false);

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in messages route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
