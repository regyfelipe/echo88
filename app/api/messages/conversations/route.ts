import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
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

    // Buscar todas as conversas do usuário
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
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversations", details: error.message },
        { status: 500 }
      );
    }

    // Agrupar mensagens por conversa (outro usuário)
    const conversationsMap = new Map();

    (messages || []).forEach((msg) => {
      const otherUserId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
          messages: [],
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      conversation.messages.push(msg);

      if (!msg.is_read && msg.receiver_id === user.id) {
        conversation.unreadCount++;
      }

      // Atualizar última mensagem se necessário
      if (
        new Date(msg.created_at) > new Date(conversation.lastMessage.created_at)
      ) {
        conversation.lastMessage = msg;
      }
    });

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in conversations route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
